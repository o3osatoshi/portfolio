import { okAsync, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { type OutputMode, printSuccessMessage } from "../../common/output";
import { getRuntimeConfig } from "../../common/runtime-config";
import { revokeRefreshToken } from "../../services/auth/oidc.service";
import {
  clearTokenSet,
  readTokenSet,
} from "../../services/auth/token-store.service";

export function runAuthLogout(
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  return readTokenSet()
    .orElse(() => okAsync(null))
    .andThen((token) => {
      const refreshTokenValue = token?.refresh_token;
      if (!refreshTokenValue) {
        return okAsync(undefined);
      }

      return getRuntimeConfig()
        .asyncAndThen((config) =>
          revokeRefreshToken(config.oidc, refreshTokenValue).orElse(() =>
            okAsync(undefined),
          ),
        )
        .orElse(() => okAsync(undefined));
    })
    .andThen(() => clearTokenSet())
    .map(() => {
      printSuccessMessage("auth.logout", "Logged out.", outputMode);
      return undefined;
    });
}
