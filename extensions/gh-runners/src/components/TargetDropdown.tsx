import { List } from "@raycast/api";
import { Alias } from "../utils/gh";

// Pick "all" or one alias from ~/.config/gh-runners/repos; the last choice is remembered per command.
export function TargetDropdown(props: {
  aliases: Alias[];
  onChange: (target: string) => void;
}) {
  return (
    <List.Dropdown tooltip="Repositories" storeValue onChange={props.onChange}>
      <List.Dropdown.Item title="All Aliases" value="all" />
      <List.Dropdown.Section title="Aliases">
        {props.aliases.map((a) => (
          <List.Dropdown.Item
            key={a.alias}
            title={`${a.alias}  ${a.repository}`}
            value={a.alias}
          />
        ))}
      </List.Dropdown.Section>
    </List.Dropdown>
  );
}

export function NoAliasesView() {
  return (
    <List.EmptyView
      title="No aliases configured"
      description={
        'Add one "ALIAS OWNER/REPO" per line to ~/.config/gh-runners/repos'
      }
    />
  );
}
