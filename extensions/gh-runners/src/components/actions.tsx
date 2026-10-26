import { Action, Icon } from "@raycast/api";
import { runnersSettingsUrl } from "../utils/gh";
import { RunsList } from "./RunsList";

export function runnersSettingsAction(repository: string) {
  return (
    <Action.OpenInBrowser
      title="Open Runner Settings"
      icon={Icon.Gear}
      url={runnersSettingsUrl(repository)}
      shortcut={{ modifiers: ["cmd", "shift"], key: "g" }}
    />
  );
}

export function showRunsAction(repository: string) {
  return (
    <Action.Push
      title="Show Workflow Runs"
      icon={Icon.List}
      target={<RunsList target={repository} />}
      shortcut={{ modifiers: ["cmd", "shift"], key: "w" }}
    />
  );
}
