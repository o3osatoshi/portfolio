import { okAsync, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { toAsync } from "../../lib/cli-result";
import { getRuntimeConfig } from "../../lib/config";
import { revokeRefreshToken } from "../../lib/oidc";
import { type OutputMode, printSuccessMessage } from "../../lib/output";
import { clearTokenSet, readTokenSet } from "../../lib/token-store";

export function runAuthLogout(
  outputMode: OutputMode = "text",
): ResultAsync<void, RichError> {
  return readTokenSet()
    .andThen((token) => {
      const refreshTokenValue = token?.refresh_token;
      if (!refreshTokenValue) {
        return okAsync(undefined);
      }

      return toAsync(getRuntimeConfig())
        .andThen((config) =>
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
