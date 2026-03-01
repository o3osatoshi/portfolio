import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { toAsync } from "../../lib/cli-result";
import { getRuntimeConfig } from "../../lib/config";
import { type LoginMode, loginWithOidc } from "../../lib/oidc";
import { type OutputMode, printSuccessMessage } from "../../lib/output";
import { writeTokenSet } from "../../lib/token-store";

export function runAuthLogin(
  mode: LoginMode,
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  const onInfo =
    outputMode === "json"
      ? (message: string) => console.error(message)
      : (message: string) => console.log(message);

  return toAsync(getRuntimeConfig())
    .andThen((config) => loginWithOidc(config.oidc, mode, { onInfo }))
    .andThen((token) => writeTokenSet(token))
    .map(() => {
      printSuccessMessage("auth.login", "Login successful.", outputMode);
      return undefined;
    });
}
