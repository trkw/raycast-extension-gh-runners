import { useState } from "react";
import { Action, ActionPanel, Icon, List, Keyboard } from "@raycast/api";
import { runnersSettingsAction, showRunsAction } from "./components/actions";
import { NoAliasesView, TargetDropdown } from "./components/TargetDropdown";
import { Runner } from "./utils/gh";
import { useAliases, useGhRunners } from "./utils/hooks";
import { runnerAccessories, runnerIcon } from "./utils/status";

export default function Command() {
  const aliases = useAliases();
  const [target, setTarget] = useState("");
  const noAliases = !aliases.isLoading && aliases.items.length === 0;
  const { items, isLoading, revalidate } = useGhRunners<Runner>(
    ["list", target],
    target !== "" && !noAliases,
  );
  const repositories = [...new Set(items.map((runner) => runner.repository))];

  return (
    <List
      isLoading={aliases.isLoading || isLoading}
      searchBarPlaceholder="Search runners..."
      searchBarAccessory={
        <TargetDropdown aliases={aliases.items} onChange={setTarget} />
      }
    >
      {noAliases ? (
        <NoAliasesView />
      ) : (
        !isLoading && (
          <List.EmptyView icon={Icon.ComputerChip} title="No runners visible" />
        )
      )}
      {repositories.map((repository) => (
        <List.Section key={repository} title={repository}>
          {items
            .filter((runner) => runner.repository === repository)
            .map((runner) => (
              <List.Item
                key={runner.name}
                icon={{
                  value: runnerIcon(runner.status, runner.busy),
                  tooltip: runner.status,
                }}
                title={runner.name}
                subtitle={runner.labels.join(", ")}
                keywords={[...runner.labels, runner.status]}
                accessories={runnerAccessories(runner)}
                actions={
                  <ActionPanel>
                    {runnersSettingsAction(repository)}
                    {showRunsAction(repository)}
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
                  </ActionPanel>
                }
              />
            ))}
        </List.Section>
      ))}
    </List>
  );
}
