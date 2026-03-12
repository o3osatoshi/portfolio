import { errAsync, type ResultAsync } from "neverthrow";

import { deserialize, type RichError, sleep } from "@o3osatoshi/toolkit";

import { cliErrorCodes } from "../../common/error-catalog";
import { fetchHttp } from "../../common/http/fetch";
import { fetchJson, readHttpText } from "../../common/http/fetch";
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

export function loginByDevice(
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

  const body = new URLSearchParams({
    client_id: config.clientId,
    audience: config.audience,
    scope:
      "openid profile email offline_access transactions:read transactions:write",
  });

  return fetchJson({
    body,
    decode: {
      context: {
        action: "DecodeOidcDeviceCodeResponse",
        code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
        context: "OIDC device authorization response",
        fallbackHint: "Retry `o3o auth login --mode device`.",
      },
      schema: oidcDeviceAuthorizationResponseSchema,
    },
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    method: "POST",
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
    url: discovery.device_authorization_endpoint,
  }).andThen((deviceAuth) => {
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
    const body = new URLSearchParams({
      client_id: config.clientId,
      device_code: deviceAuth.device_code,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
    });

    return fetchHttp(
      discovery.token_endpoint,
      {
        body,
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
      .andThen((res) =>
        readHttpText(res, {
          action: "ReadOidcTokenResponseBody",
          code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
          kind: "BadGateway",
          reason: "Failed to read OIDC token response body.",
        }).map((resText) => {
          const trimmedText = resText.trim();
          const resJson =
            trimmedText.length === 0
              ? null
              : deserialize(trimmedText).match(
                  (decodedText) => decodedText,
                  () => null,
                );

          return {
            res,
            resJson,
            resText,
          };
        }),
      )
      .andThen(({ res, resJson, resText }) => {
        if (res.ok) {
          if (resJson === null) {
            return errAsync(
              newOidcError({
                action: "DeserializeOidcTokenResponseBody",
                code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                kind: "BadGateway",
                reason: `Device login failed: received invalid JSON from token endpoint (status ${res.status}).`,
              }),
            );
          }

          const result = makeCliSchemaParser(oidcTokenResponseSchema, {
            action: "DecodeOidcTokenResponseFromDeviceFlow",
            code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
            context: "OIDC token response",
            fallbackHint: "Retry `o3o auth login --mode device`.",
          })(resJson);
          return result.map(toTokenSetWithExpiry);
        }

        if (resJson === null) {
          const detail = resText.trim() || "no response body";
          return errAsync(
            newOidcError({
              action: "PollOidcDeviceToken",
              code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
              kind: "Unauthorized",
              reason: `Device login failed with status ${res.status}: ${detail}`,
            }),
          );
        }

        const result = oidcDeviceTokenErrorSchema.safeParse(resJson);
        const errorCode =
          result.success && result.data.error
            ? result.data.error
            : "unknown_error";

        switch (errorCode) {
          case "authorization_pending":
            return pollDeviceAuth(
              config,
              discovery,
              deviceAuth,
              interval,
              expiresAt,
            );
          case "slow_down":
            return pollDeviceAuth(
              config,
              discovery,
              deviceAuth,
              interval + 5,
              expiresAt,
            );
          case "expired_token":
            return errAsync(
              newOidcError({
                action: "PollOidcDeviceToken",
                code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                kind: "Unauthorized",
                reason: "Device login expired. Please retry.",
              }),
            );
          default:
            return errAsync(
              newOidcError({
                action: "PollOidcDeviceToken",
                code: cliErrorCodes.CLI_AUTH_LOGIN_FAILED,
                kind: "Unauthorized",
                reason: `Device login failed: ${errorCode}`,
              }),
            );
        }
      });
  });
}
