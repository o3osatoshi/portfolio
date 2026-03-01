import { fetchMe } from "../../lib/api-client";
import type { CliResultAsync } from "../../lib/types";

export function runAuthWhoami(): CliResultAsync<void> {
  return fetchMe().map((me) => {
    console.log(JSON.stringify(me, null, 2));
    return undefined;
  });
}
