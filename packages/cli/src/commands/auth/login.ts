import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { type OutputMode, printSuccessMessage } from "../../common/output";
import { getRuntimeConfig } from "../../common/runtime-config";
import {
  loginWithOidc,
  type OidcLoginMode,
} from "../../services/auth/oidc.service";
import { writeTokenSet } from "../../services/auth/token-store.service";

export function runAuthLogin(
  mode: OidcLoginMode,
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  const onInfo =
    outputMode === "json"
      ? (message: string) => console.error(message)
      : (message: string) => console.log(message);

  return getRuntimeConfig()
    .asyncAndThen((config) => loginWithOidc(config.oidc, mode, { onInfo }))
    .andThen((token) => writeTokenSet(token))
    .map(() => {
      printSuccessMessage("auth.login", "Login successful.", outputMode);
      return undefined;
    });
}
