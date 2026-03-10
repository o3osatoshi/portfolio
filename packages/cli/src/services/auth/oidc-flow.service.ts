import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import { requestHttp } from "../../common/http/http";
import {
  expectOkHttpResponse,
  requestParsedJson,
} from "../../common/http/http";
import type { OidcConfig, OidcTokenSet } from "../../common/types";
import { makeCliSchemaParser } from "../../common/zod-validation";
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
  ).andThen((discovery) => {
    switch (mode) {
      case "device":
        return loginByDevice(config, discovery, options);
      case "pkce":
        return loginByPkce(config, discovery);
      case "auto":
        return loginByPkce(config, discovery).orElse((error) => {
          if (!shouldFallbackToDeviceFlow(error)) {
            return errAsync(error);
          }
          return loginByDevice(config, discovery, options);
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
  ).andThen((discovery) => {
    const body = new URLSearchParams({
      client_id: config.clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });

    return requestParsedJson(
      discovery.token_endpoint,
      {
        body,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
      {
        parser: makeCliSchemaParser(oidcTokenResponseSchema, {
          action: "DecodeOidcTokenResponseFromRefreshFlow",
          code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
          context: "OIDC token response",
          fallbackHint: "Run `o3o auth login` and retry.",
        }),
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
      },
    ).map(toTokenSetWithExpiry);
  });
}

export function unsafeRevokeRefreshToken(
  config: OidcConfig,
  refreshToken: string,
): ResultAsync<void, RichError> {
  return requestOidcDiscovery(
    config.issuer,
    cliErrorCodes.CLI_AUTH_REVOKE_FAILED,
  ).andThen((discovery) => {
    if (!discovery.revocation_endpoint) {
      return okAsync();
    }

    const body = new URLSearchParams({
      client_id: config.clientId,
      token: refreshToken,
      token_type_hint: "refresh_token",
    });

    return requestHttp(
      discovery.revocation_endpoint,
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
