import { ReactNode } from "react";
import { Action, ActionPanel, Icon, List, Keyboard } from "@raycast/api";
import { runnersSettingsAction } from "./actions";
import { runsLimit, WorkflowRun } from "../utils/gh";
import { useGhRunners } from "../utils/hooks";
import { runIcon, runResult } from "../utils/status";

// Recent workflow runs of TARGET (OWNER/REPO, an alias or "all"), grouped by repository.
export function RunsList(props: {
  target: string;
  searchBarAccessory?: List.Props["searchBarAccessory"];
  emptyView?: ReactNode;
}) {
  const { items, isLoading, revalidate } = useGhRunners<WorkflowRun>(
    ["runs", props.target, runsLimit()],
    props.target !== "",
  );
  const repositories = [...new Set(items.map((run) => run.repository))];

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Search workflow runs..."
      searchBarAccessory={props.searchBarAccessory}
      navigationTitle={props.target.includes("/") ? props.target : undefined}
    >
      {props.emptyView ??
        (!isLoading && (
          <List.EmptyView icon={Icon.List} title="No workflow runs" />
        ))}
      {repositories.map((repository) => (
        <List.Section key={repository} title={repository}>
          {items
            .filter((run) => run.repository === repository)
            .map((run) => (
              <List.Item
                key={run.id}
                icon={{ value: runIcon(run), tooltip: runResult(run) }}
                title={run.title}
                subtitle={run.workflow}
                keywords={[run.workflow, run.branch, runResult(run)]}
                accessories={[
                  { tag: run.branch, icon: Icon.Code },
                  { date: new Date(run.createdAt), tooltip: run.createdAt },
                ]}
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser url={run.url} />
                    <Action.CopyToClipboard
                      title="Copy URL"
                      content={run.url}
                    />
                    {runnersSettingsAction(run.repository)}
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
