import { showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { Alias, JsonResult, runJson } from "./gh";

async function warn(result: JsonResult<unknown>) {
  if (result.warning) {
    await showToast({
      style: Toast.Style.Failure,
      title: "Some repositories could not be read",
      message: result.warning,
    });
  }
}

// gh runners ARGS --json, reloaded with revalidate(). Nothing runs while execute is false.
export function useGhRunners<T>(args: string[], execute = true) {
  const { data, isLoading, error, revalidate } = usePromise(
    (a: string[]) => runJson<T>(a),
    [args],
    {
      execute,
      onData: warn,
      failureToastOptions: { title: "gh runners failed" },
    },
  );
  return {
    items: data?.items ?? [],
    isLoading: execute && isLoading,
    error,
    revalidate,
  };
}

export function useAliases() {
  return useGhRunners<Alias>(["aliases"]);
}
