import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import type { OidcConfig, OidcTokenSet } from "../../common/types";
import { makeCliSchemaParser } from "../../common/zod-validation";
import { oidcTokenResponseSchema } from "./contracts/oidc.schema";
import { loginByDeviceCode } from "./oidc-device.service";
import {
  discover,
  expectOkResponse,
  fetchResponse,
  readJson,
} from "./oidc-http";
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
  return discover(config.issuer, cliErrorCodes.CLI_AUTH_LOGIN_FAILED).andThen(
    (discovery) => {
      switch (mode) {
        case "device":
          return loginByDeviceCode(config, discovery, options);
        case "pkce":
          return loginByPkce(config, discovery);
        case "auto":
          return loginByPkce(config, discovery).orElse((error) => {
            if (!shouldFallbackToDeviceFlow(error)) {
              return errAsync(error);
            }
            return loginByDeviceCode(config, discovery, options);
          });
      }
    },
  );
}

export function unsafeRefreshTokens(
  config: OidcConfig,
  refreshToken: string,
): ResultAsync<OidcTokenSet, RichError> {
  return discover(config.issuer, cliErrorCodes.CLI_AUTH_REFRESH_FAILED).andThen(
    (discovery) => {
      const body = new URLSearchParams({
        client_id: config.clientId,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      });

      return fetchResponse(
        discovery.token_endpoint,
        {
          body,
          headers: {
            "content-type": "application/x-www-form-urlencoded",
          },
          method: "POST",
        },
        {
          action: "RefreshOidcTokens",
          code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
          kind: "BadGateway",
          reason: "Refresh token request failed.",
        },
      )
        .andThen((response) =>
          expectOkResponse(response, {
            action: "RefreshOidcTokens",
            code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
            kind: "BadGateway",
            reason: "Refresh token request failed.",
          }),
        )
        .andThen((response) =>
          readJson(response, {
            action: "ReadOidcTokenResponseBody",
            code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
            kind: "BadGateway",
            reason: "Failed to read OIDC token response body.",
          }),
        )
        .andThen((json) => {
          const parsed = makeCliSchemaParser(oidcTokenResponseSchema, {
            action: "DecodeOidcTokenResponseFromRefreshFlow",
            code: cliErrorCodes.CLI_AUTH_REFRESH_FAILED,
            context: "OIDC token response",
            fallbackHint: "Run `o3o auth login` and retry.",
          })(json);

          return parsed.isOk()
            ? okAsync(toTokenSetWithExpiry(parsed.value))
            : errAsync(parsed.error);
        });
    },
  );
}

export function unsafeRevokeRefreshToken(
  config: OidcConfig,
  refreshToken: string,
): ResultAsync<void, RichError> {
  return discover(config.issuer, cliErrorCodes.CLI_AUTH_REVOKE_FAILED).andThen(
    (discovery) => {
      if (!discovery.revocation_endpoint) {
        return okAsync(undefined);
      }

      const body = new URLSearchParams({
        client_id: config.clientId,
        token: refreshToken,
        token_type_hint: "refresh_token",
      });

      return fetchResponse(
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
          expectOkResponse(response, {
            action: "RevokeOidcRefreshToken",
            code: cliErrorCodes.CLI_AUTH_REVOKE_FAILED,
            kind: "BadGateway",
            reason: "Revocation request failed.",
          }),
        )
        .map(() => undefined);
    },
  );
}
