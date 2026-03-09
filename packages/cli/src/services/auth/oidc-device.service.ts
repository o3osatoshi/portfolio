import { errAsync, ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import { requestHttp } from "../../common/http/http-request";
import {
  decodeHttpJson,
  readHttpText,
  requestHttpJsonWithParser,
} from "../../common/http/http-response";
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

  return requestHttpJsonWithParser(
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
  ).andThen((deviceCode) => {
    const url =
      deviceCode.verification_uri_complete ?? deviceCode.verification_uri;
    if (deviceCode.verification_uri_complete) {
      options?.onInfo?.(`Open this URL to continue login:\n${url}`);
    } else {
      options?.onInfo?.(
        `Open ${deviceCode.verification_uri} and enter code: ${deviceCode.user_code}`,
      );
    }

    return pollDeviceToken(
      config,
      discovery,
      deviceCode,
      deviceCode.interval,
      Date.now() + deviceCode.expires_in * 1000,
    );
  });
}

export function pollDeviceToken(
  config: OidcConfig,
  discovery: OidcDiscoveryResponse,
  deviceCode: OidcDeviceAuthorizationResponse,
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

  return ResultAsync.fromSafePromise(sleep(interval * 1000)).andThen(() => {
    const tokenBody = new URLSearchParams({
      client_id: config.clientId,
      device_code: deviceCode.device_code,
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
          return pollDeviceToken(
            config,
            discovery,
            deviceCode,
            interval,
            expiresAt,
          );
        }

        if (error === "slow_down") {
          return pollDeviceToken(
            config,
            discovery,
            deviceCode,
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
