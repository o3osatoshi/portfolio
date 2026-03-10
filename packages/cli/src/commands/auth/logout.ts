import { ok, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { type OutputMode, printSuccessMessage } from "../../common/output";
import { resolveRuntimeEnv } from "../../common/runtime-env";
import { revokeRefreshToken } from "../../services/auth/oidc.service";
import {
  clearTokenSet,
  readTokenSet,
} from "../../services/auth/token-store.service";

export function runAuthLogout(
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  return readTokenSet()
    .orElse(() => ok())
    .andThen((tokenSet) => {
      const refreshToken = tokenSet?.refresh_token;
      if (!refreshToken) {
        return ok();
      }
      return resolveRuntimeEnv()
        .asyncAndThen((env) =>
          revokeRefreshToken(env.oidcConfig, refreshToken).orElse(() => ok()),
        )
        .orElse(() => ok());
    })
    .andThen(() => clearTokenSet())
    .andTee(() => {
      printSuccessMessage("auth.logout", "Logged out.", outputMode);
    })
    .map(() => undefined);
}
