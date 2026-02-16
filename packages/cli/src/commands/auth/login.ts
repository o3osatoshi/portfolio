import { getRuntimeConfig } from "../../lib/config";
import { type LoginMode, loginWithOidc } from "../../lib/oidc";
import { writeTokenSet } from "../../lib/token-store";

export async function runAuthLogin(mode: LoginMode): Promise<void> {
  const config = getRuntimeConfig();
  const token = await loginWithOidc(config.oidc, mode);
  await writeTokenSet(token);
  console.log("Login successful.");
}
