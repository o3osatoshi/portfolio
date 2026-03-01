import { toAsync } from "../../lib/cli-result";
import { getRuntimeConfig } from "../../lib/config";
import { type LoginMode, loginWithOidc } from "../../lib/oidc";
import { writeTokenSet } from "../../lib/token-store";
import type { CliResultAsync } from "../../lib/types";

export function runAuthLogin(mode: LoginMode): CliResultAsync<void> {
  return toAsync(getRuntimeConfig())
    .andThen((config) => loginWithOidc(config.oidc, mode))
    .andThen((token) => writeTokenSet(token))
    .map(() => {
      console.log("Login successful.");
      return undefined;
    });
}
