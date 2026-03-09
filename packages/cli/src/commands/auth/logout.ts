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
    .orElse(() => ok(null))
    .andThen((token) => {
      const refreshTokenValue = token?.refresh_token;
      if (!refreshTokenValue) {
        return ok(undefined);
      }

      return resolveRuntimeEnv()
        .asyncAndThen((env) =>
          revokeRefreshToken(env.oidcConfig, refreshTokenValue).orElse(() =>
            ok(undefined),
          ),
        )
        .orElse(() => ok(undefined));
    })
    .andThen(() => clearTokenSet())
    .andTee(() => {
      printSuccessMessage("auth.logout", "Logged out.", outputMode);
    })
    .map(() => undefined);
}
