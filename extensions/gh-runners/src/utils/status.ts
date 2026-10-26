import { Color, Icon, Image, List } from "@raycast/api";
import { LocalRunner, Runner, WorkflowRun } from "./gh";

type Accessory = List.Item.Accessory;

export function runnerIcon(
  status: string | null,
  busy: boolean | null,
): Image.ImageLike {
  if (status === "online")
    return {
      source: Icon.CircleFilled,
      tintColor: busy ? Color.Orange : Color.Green,
    };
  if (status === "offline")
    return { source: Icon.CircleFilled, tintColor: Color.Red };
  return { source: Icon.Circle, tintColor: Color.SecondaryText };
}

export function statusTag(
  status: string | null,
  busy: boolean | null,
): Accessory {
  if (status === null)
    return {
      tag: { value: "GitHub ?", color: Color.SecondaryText },
      tooltip: "GitHub could not be read",
    };
  if (status === "online" && busy)
    return { tag: { value: "busy", color: Color.Orange } };
  const color =
    status === "online"
      ? Color.Green
      : status === "offline"
        ? Color.Red
        : Color.SecondaryText;
  return { tag: { value: status, color } };
}

export function serviceTag(service: string): Accessory {
  const color =
    service === "running"
      ? Color.Green
      : service === "stopped"
        ? Color.Red
        : Color.SecondaryText;
  return { tag: { value: service, color }, tooltip: "launchd service" };
}

export function localRunnerAccessories(runner: LocalRunner): Accessory[] {
  return [
    serviceTag(runner.service),
    statusTag(runner.status, runner.busy),
    { text: runner.version ?? "?", tooltip: "actions/runner version" },
  ];
}

export function runnerAccessories(runner: Runner): Accessory[] {
  return [statusTag(runner.status, runner.busy)];
}

// The result of a finished run, or its status (queued, in_progress, ...) while it is not.
export function runResult(run: WorkflowRun): string {
  return run.conclusion ?? run.status;
}

export function runIcon(run: WorkflowRun): Image.ImageLike {
  switch (runResult(run)) {
    case "success":
      return { source: Icon.CheckCircle, tintColor: Color.Green };
    case "failure":
    case "startup_failure":
    case "timed_out":
      return { source: Icon.XMarkCircle, tintColor: Color.Red };
    case "cancelled":
    case "skipped":
    case "neutral":
      return { source: Icon.MinusCircle, tintColor: Color.SecondaryText };
    case "action_required":
      return { source: Icon.ExclamationMark, tintColor: Color.Orange };
    case "in_progress":
      return { source: Icon.CircleProgress50, tintColor: Color.Yellow };
    default:
      return { source: Icon.Clock, tintColor: Color.SecondaryText };
  }
}
