import { errAsync, ResultAsync } from "neverthrow";

import { sleep, type RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import { requestHttp } from "../../common/http/http";
import {
  decodeHttpJson,
  readHttpText,
  requestParsedJson,
} from "../../common/http/http";
import type { OidcConfig, OidcTokenSet } from "../../common/types";
import { makeCliSchemaParser } from "../../common/zod-validation";
import {
  type OidcDeviceAuthorizationResponse,
  oidcDeviceAuthorizationResponseSchema,
  oidcDeviceTokenErrorSchema,
  type OidcDiscoveryResponse,
  oidcTokenResponseSchema,
} from "./contracts/oidc.schema";
import { newOidcError } from "./oidc-error";
import { toTokenSetWithExpiry } from "./oidc-token-set";

export function loginByDeviceCode(
  config: OidcConfig,
  discovery: OidcDiscoveryResponse,
  options?: { onInfo?: ((message: string) => void) | undefined },
): ResultAsync<OidcTokenSet, RichError> {
  if (!discovery.device_authorization_endpoint) {
    return errAsync(
      newOidcError({
        action: "RequestOidcDeviceAuthorization",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "Unauthorized",
        reason: "The issuer does not expose a device authorization endpoint.",
      }),
    );
  }

  const requestBody = new URLSearchParams({
    client_id: config.clientId,
    audience: config.audience,
    scope:
      "openid profile email offline_access transactions:read transactions:write",
  });

  return requestParsedJson(
    discovery.device_authorization_endpoint,
    {
      body: requestBody,
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    },
    {
      parser: makeCliSchemaParser(oidcDeviceAuthorizationResponseSchema, {
        action: "DecodeOidcDeviceCodeResponse",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        context: "OIDC device authorization response",
        fallbackHint: "Retry `o3o auth login --mode device`.",
      }),
      read: {
        action: "ReadOidcDeviceAuthorizationResponseBody",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "BadGateway",
        reason: "Failed to read OIDC device authorization response body.",
      },
      request: {
        action: "RequestOidcDeviceAuthorization",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "BadGateway",
        reason: "Device authorization failed.",
      },
    },
  ).andThen((deviceAuth) => {
    if (deviceAuth.verification_uri_complete) {
      options?.onInfo?.(
        `Open this URL to continue login:\n${deviceAuth.verification_uri_complete ?? deviceAuth.verification_uri}`,
      );
    } else {
      options?.onInfo?.(
        `Open ${deviceAuth.verification_uri} and enter code: ${deviceAuth.user_code}`,
      );
    }

    return pollDeviceAuth(
      config,
      discovery,
      deviceAuth,
      deviceAuth.interval,
      Date.now() + deviceAuth.expires_in * 1000,
    );
  });
}

export function pollDeviceAuth(
  config: OidcConfig,
  discovery: OidcDiscoveryResponse,
  deviceAuth: OidcDeviceAuthorizationResponse,
  interval: number,
  expiresAt: number,
): ResultAsync<OidcTokenSet, RichError> {
  if (Date.now() >= expiresAt) {
    return errAsync(
      newOidcError({
        action: "PollOidcDeviceToken",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "Unauthorized",
        reason: "Device login timed out.",
      }),
    );
  }

  return sleep(interval * 1000).andThen(() => {
    const tokenBody = new URLSearchParams({
      client_id: config.clientId,
      device_code: deviceAuth.device_code,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    });

    return requestHttp(
      discovery.token_endpoint,
      {
        body: tokenBody,
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        method: "POST",
      },
      {
        action: "PollOidcDeviceToken",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        kind: "BadGateway",
        reason: "Failed to poll OIDC device token.",
      },
    )
      .andThen((tokenResponse) =>
        readHttpText(tokenResponse, {
          action: "ReadOidcTokenResponseBody",
          code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
          kind: "BadGateway",
          reason: "Failed to read OIDC token response body.",
        }).map((responseText) => ({
          json: parseJsonSafely(responseText),
          responseText,
          tokenResponse,
        })),
      )
      .andThen(({ json, responseText, tokenResponse }) => {
        if (tokenResponse.ok) {
          if (json === null) {
            return errAsync(
              newOidcError({
                action: "DeserializeOidcTokenResponseBody",
                code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                kind: "BadGateway",
                reason: `Device login failed: received invalid JSON from token endpoint (status ${tokenResponse.status}).`,
              }),
            );
          }

          const parsed = makeCliSchemaParser(oidcTokenResponseSchema, {
            action: "DecodeOidcTokenResponseFromDeviceFlow",
            code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
            context: "OIDC token response",
            fallbackHint: "Retry `o3o auth login --mode device`.",
          })(json);
          return parsed.map(toTokenSetWithExpiry);
        }

        if (json === null) {
          const detail = responseText.trim() || "no response body";
          return errAsync(
            newOidcError({
              action: "PollOidcDeviceToken",
              code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
              kind: "Unauthorized",
              reason: `Device login failed with status ${tokenResponse.status}: ${detail}`,
            }),
          );
        }

        const parsedError = oidcDeviceTokenErrorSchema.safeParse(json);
        const error =
          parsedError.success && parsedError.data.error
            ? parsedError.data.error
            : "unknown_error";

        if (error === "authorization_pending") {
          return pollDeviceAuth(
            config,
            discovery,
            deviceAuth,
            interval,
            expiresAt,
          );
        }

        if (error === "slow_down") {
          return pollDeviceAuth(
            config,
            discovery,
            deviceAuth,
            interval + 5,
            expiresAt,
          );
        }

        if (error === "expired_token") {
          return errAsync(
            newOidcError({
              action: "PollOidcDeviceToken",
              code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
              kind: "Unauthorized",
              reason: "Device login expired. Please retry.",
            }),
          );
        }

        return errAsync(
          newOidcError({
            action: "PollOidcDeviceToken",
            code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
            kind: "Unauthorized",
            reason: `Device login failed: ${error}`,
          }),
        );
      });
  });
}

function parseJsonSafely(text: string): null | unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = decodeHttpJson(trimmed, {
    action: "DeserializeOidcTokenResponseBody",
    code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
    kind: "BadGateway",
    reason: "Failed to deserialize OIDC token response body.",
  });
  return parsed.isOk() ? parsed.value : null;
}
