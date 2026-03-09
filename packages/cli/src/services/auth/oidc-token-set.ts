import { omitUndefined } from "@o3osatoshi/toolkit";

import type { OidcTokenSet } from "../../common/types";
import type { OidcTokenResponse } from "./contracts/oidc.schema";

export function toTokenSetWithExpiry(token: OidcTokenResponse): OidcTokenSet {
  const expiresAt =
    token.expires_in !== undefined
      ? Math.floor(Date.now() / 1000) + token.expires_in
      : undefined;

  return omitUndefined({
    access_token: token.access_token,
    expires_at: expiresAt,
    refresh_token: token.refresh_token,
    scope: token.scope,
    token_type: token.token_type,
  });
}
