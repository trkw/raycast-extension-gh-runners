import { useState } from "react";
import { NoAliasesView, TargetDropdown } from "./components/TargetDropdown";
import { RunsList } from "./components/RunsList";
import { useAliases } from "./utils/hooks";

export default function Command() {
  const aliases = useAliases();
  const [target, setTarget] = useState("");
  const noAliases = !aliases.isLoading && aliases.items.length === 0;

  return (
    <RunsList
      target={noAliases ? "" : target}
      searchBarAccessory={
        <TargetDropdown aliases={aliases.items} onChange={setTarget} />
      }
      emptyView={noAliases ? <NoAliasesView /> : undefined}
    />
  );
}
