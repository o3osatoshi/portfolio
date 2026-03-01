import { okAsync, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

export function runHello(): ResultAsync<void, RichError> {
  console.log("hello world");
  return okAsync(undefined);
}
