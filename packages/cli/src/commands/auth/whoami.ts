import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { fetchMe } from "../../lib/api-client";

export function runAuthWhoami(): ResultAsync<void, RichError> {
  return fetchMe().map((me) => {
    console.log(JSON.stringify(me, null, 2));
    return undefined;
  });
}
