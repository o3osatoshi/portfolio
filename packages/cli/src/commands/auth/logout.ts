import { okAsync, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { toAsync } from "../../lib/cli-result";
import { getRuntimeConfig } from "../../lib/config";
import { revokeRefreshToken } from "../../lib/oidc";
import { clearTokenSet, readTokenSet } from "../../lib/token-store";

export function runAuthLogout(): ResultAsync<void, RichError> {
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
      console.log("Logged out.");
      return undefined;
    });
}
