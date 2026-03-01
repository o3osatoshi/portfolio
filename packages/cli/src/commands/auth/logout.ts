import { okAsync } from "neverthrow";

import { toAsync } from "../../lib/cli-result";
import { getRuntimeConfig } from "../../lib/config";
import { revokeRefreshToken } from "../../lib/oidc";
import { clearTokenSet, readTokenSet } from "../../lib/token-store";
import type { CliResultAsync } from "../../lib/types";

export function runAuthLogout(): CliResultAsync<void> {
  return toAsync(getRuntimeConfig())
    .andThen((config) =>
      readTokenSet().andThen((token) => {
        if (!token?.refresh_token) {
          return okAsync(undefined);
        }

        return revokeRefreshToken(config.oidc, token.refresh_token).orElse(() =>
          okAsync(undefined),
        );
      }),
    )
    .andThen(() => clearTokenSet())
    .map(() => {
      console.log("Logged out.");
      return undefined;
    });
}
