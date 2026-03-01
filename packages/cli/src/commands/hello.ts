import { okAsync } from "neverthrow";

import type { CliResultAsync } from "../lib/types";

export function runHello(): CliResultAsync<void> {
  console.log("hello world");
  return okAsync(undefined);
}
