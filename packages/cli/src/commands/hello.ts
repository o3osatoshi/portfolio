import { okAsync, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { type OutputMode, printSuccessMessage } from "../lib/output";

export function runHello(
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  printSuccessMessage("hello", "hello world", outputMode);
  return okAsync(undefined);
}
