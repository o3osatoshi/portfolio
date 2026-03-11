import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import { requestHttp } from "../../common/http/http";
import { expectOkHttpResponse, requestJson } from "../../common/http/http";
import type { OidcConfig, OidcTokenSet } from "../../common/types";
import { oidcTokenResponseSchema } from "./contracts/oidc.schema";
import { loginByDevice } from "./oidc-device.service";
import { requestOidcDiscovery } from "./oidc-http";
import { loginByPkce, shouldFallbackToDeviceFlow } from "./oidc-pkce.service";
import { toTokenSetWithExpiry } from "./oidc-token-set";

export type OidcLoginMode = "auto" | "device" | "pkce";

export type OidcLoginOptions = {
  onInfo?: ((message: string) => void) | undefined;
};

export function unsafeOidcLogin(
  config: OidcConfig,
  mode: OidcLoginMode,
  options?: OidcLoginOptions,
): ResultAsync<OidcTokenSet, RichError> {
  return requestOidcDiscovery(
    config.issuer,
    cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
  ).andThen((oidcDiscovery) => {
    switch (mode) {
      case "device":
        return loginByDevice(config, oidcDiscovery, options);
      case "pkce":
        return loginByPkce(config, oidcDiscovery);
      case "auto":
        return loginByPkce(config, oidcDiscovery).orElse((error) => {
          if (!shouldFallbackToDeviceFlow(error)) {
            return errAsync(error);
          }
          return loginByDevice(config, oidcDiscovery, options);
        });
    }
  });
}

export function unsafeRefreshTokens(
  config: OidcConfig,
  refreshToken: string,
): ResultAsync<OidcTokenSet, RichError> {
  return requestOidcDiscovery(
    config.issuer,
    cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
  ).andThen((oidcDiscovery) => {
    const body = new URLSearchParams({
      client_id: config.clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    return requestJson({
      body,
      decode: {
        context: {
          action: "DecodeOidcTokenResponseFromRefreshFlow",
          code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
          context: "OIDC token response",
          fallbackHint: "Run `o3o auth login` and retry.",
        },
        schema: oidcTokenResponseSchema,
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      read: {
        action: "ReadOidcTokenResponseBody",
        code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
        kind: "BadGateway",
        reason: "Failed to read OIDC token response body.",
      },
      request: {
        action: "RefreshOidcTokens",
        code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
        kind: "BadGateway",
        reason: "Refresh token request failed.",
      },
      url: oidcDiscovery.token_endpoint,
    }).map(toTokenSetWithExpiry);
  });
}

export function unsafeRevokeRefreshToken(
  config: OidcConfig,
  refreshToken: string,
): ResultAsync<void, RichError> {
  return requestOidcDiscovery(
    config.issuer,
    cliErrorCodes.CLI_AUTH_REVOKE_FAILED,
  ).andThen((oidcDiscovery) => {
    if (!oidcDiscovery.revocation_endpoint) {
      return okAsync();
    }

    const body = new URLSearchParams({
      client_id: config.clientId,
      token: refreshToken,
      token_type_hint: "refresh_token",
    });

    return requestHttp(
      oidcDiscovery.revocation_endpoint,
      {
        body,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
      {
        action: "RevokeOidcRefreshToken",
        code: cliErrorCodes.CLI_AUTH_REVOKE_FAILED,
        kind: "BadGateway",
        reason: "Revocation request failed.",
      },
    )
      .andThen((response) =>
        expectOkHttpResponse(response, {
          action: "RevokeOidcRefreshToken",
          code: cliErrorCodes.CLI_AUTH_REVOKE_FAILED,
          kind: "BadGateway",
          reason: "Revocation request failed.",
        }),
      )
      .map(() => undefined);
  });
}
