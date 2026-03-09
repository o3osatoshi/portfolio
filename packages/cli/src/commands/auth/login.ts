import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { type OutputMode, printSuccessMessage } from "../../common/output";
import { resolveRuntimeEnv } from "../../common/runtime-env";
import {
  oidcLogin,
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

  return resolveRuntimeEnv()
    .asyncAndThen((env) => oidcLogin(env.oidcConfig, mode, { onInfo }))
    .andThen((token) => writeTokenSet(token))
    .andTee(() => {
      printSuccessMessage("auth.login", "Login successful.", outputMode);
    })
    .map(() => undefined);
}
