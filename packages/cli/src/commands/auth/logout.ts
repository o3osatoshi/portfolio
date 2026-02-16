import { getRuntimeConfig } from "../../lib/config";
import { revokeRefreshToken } from "../../lib/oidc";
import { clearTokenSet, readTokenSet } from "../../lib/token-store";

export async function runAuthLogout(): Promise<void> {
  const config = getRuntimeConfig();
  const token = await readTokenSet();

  if (token?.refresh_token) {
    try {
      await revokeRefreshToken(config.oidc, token.refresh_token);
    } catch {
      // local clear still proceeds
    }
  }

  await clearTokenSet();
  console.log("Logged out.");
}
