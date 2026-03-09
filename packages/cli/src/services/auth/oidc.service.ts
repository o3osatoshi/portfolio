import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import type { OidcConfig, OidcTokenSet } from "../../common/types";
import { remapOidcError } from "./oidc-error";
import {
  type OidcLoginMode,
  type OidcLoginOptions,
  revokeRefreshTokenUnsafe,
  unsafeOidcLogin,
  unsafeRefreshTokens,
} from "./oidc-flow.service";

export type { OidcLoginMode, OidcLoginOptions } from "./oidc-flow.service";

export function oidcLogin(
  config: OidcConfig,
  mode: OidcLoginMode,
  options?: OidcLoginOptions,
): ResultAsync<OidcTokenSet, RichError> {
  return unsafeOidcLogin(config, mode, options).mapErr((cause) =>
    remapOidcError(cause, {
      action: "AuthenticateWithOidc",
      code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
      kind: "Unauthorized",
      reason: "OIDC login failed.",
    }),
  );
}

export function refreshTokens(
  config: OidcConfig,
  refreshToken: string,
): ResultAsync<OidcTokenSet, RichError> {
  return unsafeRefreshTokens(config, refreshToken).mapErr((cause) =>
    remapOidcError(cause, {
      action: "RefreshOidcTokens",
      code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
      kind: "Unauthorized",
      reason: "Failed to refresh access token.",
    }),
  );
}

export function revokeRefreshToken(
  config: OidcConfig,
  refreshToken: string,
): ResultAsync<void, RichError> {
  return revokeRefreshTokenUnsafe(config, refreshToken).mapErr((cause) =>
    remapOidcError(cause, {
      action: "RevokeOidcRefreshToken",
      code: cliErrorCodes.CLI_AUTH_REVOKE_FAILED,
      kind: "Internal",
      reason: "Failed to revoke refresh token.",
    }),
  );
}
