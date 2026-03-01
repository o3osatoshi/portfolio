import { okAsync } from "neverthrow";

import { toAsync } from "../../lib/cli-result";
import { getRuntimeConfig } from "../../lib/config";
import { revokeRefreshToken } from "../../lib/oidc";
import { clearTokenSet, readTokenSet } from "../../lib/token-store";
import type { CliResultAsync } from "../../lib/types";

export function runAuthLogout(): CliResultAsync<void> {
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
