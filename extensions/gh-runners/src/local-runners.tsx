import {
  Action,
  ActionPanel,
  Alert,
  confirmAlert,
  Icon,
  List,
  showToast,
  Toast,
  Keyboard,
} from "@raycast/api";
import { runnersSettingsAction, showRunsAction } from "./components/actions";
import {
  lastLines,
  LocalRunner,
  runGhRunners,
  ServiceAction,
} from "./utils/gh";
import { useGhRunners } from "./utils/hooks";
import { localRunnerAccessories, runnerIcon } from "./utils/status";

const progress: Record<ServiceAction, string> = {
  start: "Starting",
  stop: "Stopping",
  restart: "Restarting",
  upgrade: "Upgrading",
};

const done: Record<ServiceAction, string> = {
  start: "Started",
  stop: "Stopped",
  restart: "Restarted",
  upgrade: "Upgraded",
};

export default function Command() {
  const { items, isLoading, error, revalidate } = useGhRunners<LocalRunner>([
    "local",
  ]);

  // The runner is selected by its directory, which is unique even when names repeat across repositories.
  async function run(action: ServiceAction, runner: LocalRunner) {
    if (
      action === "stop" &&
      runner.busy &&
      !(await confirmAlert({
        title: `Stop ${runner.name}?`,
        message: "It is running a job, which will fail.",
        primaryAction: { title: "Stop", style: Alert.ActionStyle.Destructive },
      }))
    ) {
      return;
    }
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: `${progress[action]} ${runner.name}`,
    });
    try {
      // upgrade downloads the runner release, so it gets a longer timeout.
      const out = await runGhRunners(
        [action, runner.dir],
        action === "upgrade" ? 600_000 : 120_000,
      );
      if (out.code === 0) {
        toast.style = Toast.Style.Success;
        toast.title = `${done[action]} ${runner.name}`;
        toast.message = lastLines(out.stdout, 1);
      } else {
        toast.style = Toast.Style.Failure;
        toast.title = `Could not ${action} ${runner.name}`;
        toast.message = lastLines(out.stderr || out.stdout);
      }
    } catch (e) {
      toast.style = Toast.Style.Failure;
      toast.title = `Could not ${action} ${runner.name}`;
      toast.message = e instanceof Error ? e.message : String(e);
    }
    revalidate();
  }

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search runners on this Mac..."
    >
      {!isLoading && (
        <List.EmptyView
          icon={Icon.ComputerChip}
          title={error ? "Could not list runners" : "No runners on this Mac"}
          description={
            error ? error.message : "Register one with gh runners add"
          }
        />
      )}
      {items.map((runner) => (
        <List.Item
          key={runner.dir}
          icon={{
            value: runnerIcon(runner.status, runner.busy),
            tooltip: runner.status ?? "unknown",
          }}
          title={runner.name}
          subtitle={runner.repository}
          keywords={[runner.repository, runner.service, runner.status ?? ""]}
          accessories={localRunnerAccessories(runner)}
          actions={
            <ActionPanel>
              <ActionPanel.Section title="Service">
                {runner.service === "running" ? (
                  <Action
                    title="Restart"
                    icon={Icon.ArrowClockwise}
                    onAction={() => run("restart", runner)}
                  />
                ) : (
                  <Action
                    title="Start"
                    icon={Icon.Play}
                    onAction={() => run("start", runner)}
                  />
                )}
                {runner.service === "running" ? (
                  <Action
                    title="Stop"
                    icon={Icon.Stop}
                    style={Action.Style.Destructive}
                    shortcut={{ modifiers: ["ctrl"], key: "x" }}
                    onAction={() => run("stop", runner)}
                  />
                ) : (
                  <Action
                    title="Restart"
                    icon={Icon.ArrowClockwise}
                    shortcut={{ modifiers: ["cmd", "shift"], key: "r" }}
                    onAction={() => run("restart", runner)}
                  />
                )}
                <Action
                  title="Upgrade"
                  icon={Icon.Download}
                  shortcut={{ modifiers: ["cmd", "shift"], key: "u" }}
                  onAction={() => run("upgrade", runner)}
                />
              </ActionPanel.Section>
              <ActionPanel.Section>
                {showRunsAction(runner.repository)}
                {runnersSettingsAction(runner.repository)}
                <Action.ShowInFinder
                  path={runner.dir}
                  shortcut={{ modifiers: ["cmd"], key: "f" }}
                />
                <Action.CopyToClipboard
                  title="Copy Runner Name"
                  content={runner.name}
                />
                <Action
                  title="Refresh"
                  icon={Icon.ArrowClockwise}
                  shortcut={Keyboard.Shortcut.Common.Refresh}
                  onAction={revalidate}
                />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
