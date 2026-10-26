import { execFile } from "child_process";
import { accessSync, constants } from "fs";
import { homedir, userInfo } from "os";
import { dirname, join } from "path";
import { getPreferenceValues } from "@raycast/api";

export interface Runner {
  repository: string;
  name: string;
  status: string;
  busy: boolean;
  labels: string[];
}

export interface LocalRunner {
  name: string;
  repository: string;
  service: string; // running / stopped / not installed
  status: string | null; // online / offline / "not registered"; null when GitHub could not be read
  busy: boolean | null;
  version: string | null;
  dir: string;
}

export interface WorkflowRun {
  repository: string;
  id: number;
  status: string;
  conclusion: string | null;
  workflow: string;
  title: string;
  branch: string;
  createdAt: string;
  url: string;
}

export interface Alias {
  alias: string;
  repository: string;
}

export type ServiceAction = "start" | "stop" | "restart" | "upgrade";

// Raycast starts commands with a minimal PATH, so gh (and the bash it runs the extension with)
// is looked up in the usual Homebrew and Nix locations first.
function binDirs(): string[] {
  const home = homedir();
  return [
    "/opt/homebrew/bin",
    "/usr/local/bin",
    join(home, ".nix-profile/bin"),
    `/etc/profiles/per-user/${userInfo().username}/bin`,
    "/run/current-system/sw/bin",
    "/nix/var/nix/profiles/default/bin",
  ];
}

function isExecutable(path: string): boolean {
  try {
    accessSync(path, constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export function ghPath(): string {
  const { ghPath } = getPreferenceValues<Preferences>();
  const configured = ghPath?.trim().replace(/^~(?=$|\/)/, homedir());
  if (configured) return configured;
  return (
    binDirs()
      .map((dir) => join(dir, "gh"))
      .find(isExecutable) ?? "gh"
  );
}

function env(gh: string): NodeJS.ProcessEnv {
  const dirs = gh.includes("/") ? [dirname(gh), ...binDirs()] : binDirs();
  return {
    ...process.env,
    PATH: [...dirs, process.env.PATH || "/usr/bin:/bin:/usr/sbin:/sbin"].join(
      ":",
    ),
    GH_PROMPT_DISABLED: "1",
    NO_COLOR: "1",
  };
}

export interface Output {
  code: number;
  stdout: string;
  stderr: string;
}

export class GhNotFoundError extends Error {
  constructor(path: string) {
    super(
      `gh not found: ${path}. Install gh or set its path in the extension preferences.`,
    );
  }
}

// Run "gh runners ARGS..." and resolve with its output, also when it exits non-zero.
export function runGhRunners(
  args: string[],
  timeout = 60_000,
): Promise<Output> {
  const gh = ghPath();
  return new Promise((resolve, reject) => {
    execFile(
      gh,
      ["runners", ...args],
      { env: env(gh), timeout, maxBuffer: 16 * 1024 * 1024, encoding: "utf8" },
      (error, stdout, stderr) => {
        if (error && (error as NodeJS.ErrnoException).code === "ENOENT") {
          reject(new GhNotFoundError(gh));
          return;
        }
        if (error && error.killed) {
          reject(new Error(`gh runners ${args.join(" ")} timed out`));
          return;
        }
        const code = error
          ? typeof error.code === "number"
            ? error.code
            : 1
          : 0;
        resolve({ code, stdout, stderr });
      },
    );
  });
}

export interface JsonResult<T> {
  items: T[];
  // stderr of a partial failure: some repositories could not be read, the rest are in items.
  warning?: string;
}

// gh runners prints the JSON array even when one repository fails, and exits non-zero.
export async function runJson<T>(args: string[]): Promise<JsonResult<T>> {
  const { code, stdout, stderr } = await runGhRunners([...args, "--json"]);
  let items: T[] | undefined;
  try {
    const parsed: unknown = JSON.parse(stdout);
    if (Array.isArray(parsed)) items = parsed as T[];
  } catch {
    // Not JSON: an error message on stderr instead.
  }
  if (!items)
    throw new Error(
      lastLines(stderr || stdout) ||
        `gh runners ${args.join(" ")} failed (exit ${code})`,
    );
  return {
    items,
    warning: code === 0 ? undefined : lastLines(stderr) || `exit ${code}`,
  };
}

export function lastLines(text: string, count = 3): string {
  return text.trim().split("\n").slice(-count).join("\n");
}

export function runsLimit(): string {
  const value = Number.parseInt(
    getPreferenceValues<Preferences>().runsLimit ?? "",
    10,
  );
  return String(
    Number.isInteger(value) && value >= 1 && value <= 100 ? value : 10,
  );
}

export function runnersSettingsUrl(repository: string): string {
  return `https://github.com/${repository}/settings/actions/runners`;
}
