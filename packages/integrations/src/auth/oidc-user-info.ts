import { errAsync, okAsync, type ResultAsync } from "neverthrow";
import { z } from "zod";

import { httpStatusToKind, type RichError } from "@o3osatoshi/toolkit";

import {
  createSmartFetch,
  type CreateSmartFetchOptions,
  type SmartFetchRequestCacheOptions,
  type SmartFetchRequestRetryOptions,
} from "../http";
import { newIntegrationError } from "../integration-error";
import { integrationErrorCodes } from "../integration-error-catalog";

export const oidcUserInfoSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  email_verified: z.boolean().optional(),
  picture: z.string().optional(),
  sub: z.string().optional(),
});

const DEFAULT_OIDC_USERINFO_REQUEST_ACTION = "FetchOidcUserInfo";
const DEFAULT_OIDC_USERINFO_DECODE_BODY_ACTION = "DecodeOidcUserInfoBody";

export type OidcUserInfo = {
  email?: string | undefined;
  emailVerified: boolean;
  image?: string | undefined;
  name?: string | undefined;
  subject: string;
};

export type OidcUserInfoFetcherInput = {
  accessToken: string;
  cache?: SmartFetchRequestCacheOptions<typeof oidcUserInfoSchema> | undefined;
  issuer: string;
  retry?: SmartFetchRequestRetryOptions<typeof oidcUserInfoSchema> | undefined;
};

export type OidcUserInfoFetcherOptions = {
  fetch?: typeof fetch;
  unauthorizedReason?: string;
} & Omit<CreateSmartFetchOptions, "fetch">;

/**
 * Fetch and validate OIDC user info claims from a provider's userinfo endpoint.
 */
export function createOidcUserInfoFetcher(options: OidcUserInfoFetcherOptions) {
  const action = DEFAULT_OIDC_USERINFO_REQUEST_ACTION;
  const decodeAction = DEFAULT_OIDC_USERINFO_DECODE_BODY_ACTION;
  const sFetch = createSmartFetch({
    cache: options.cache,
    fetch: options.fetch ?? fetch,
    retry: options.retry,
  });

  return (
    input: OidcUserInfoFetcherInput,
  ): ResultAsync<OidcUserInfo, RichError> => {
    const normalizedIssuer = input.issuer.endsWith("/")
      ? input.issuer.slice(0, -1)
      : input.issuer;
    const url = `${normalizedIssuer}/userinfo`;

    return sFetch<typeof oidcUserInfoSchema>({
      cache: input.cache,
      decode: {
        context: {
          action: decodeAction,
          layer: "External",
        },
        schema: oidcUserInfoSchema,
      },
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      method: "GET",
      retry: input.retry,
      url,
    })
      .orElse((cause) => errAsync(mapFetchError(cause, action, decodeAction)))
      .andThen((res) => {
        if (!res.response.ok) {
          const status = res.response.status;
          if (status === 401 || status === 403) {
            return errAsync(
              newIntegrationError({
                code: integrationErrorCodes.OIDC_USERINFO_UNAUTHORIZED,
                details: {
                  action,
                  reason:
                    options.unauthorizedReason ??
                    `/userinfo request rejected by the IdP (HTTP ${status}).`,
                },
                i18n: { key: "errors.application.unauthorized" },
                isOperational: true,
                kind: "Unauthorized",
              }),
            );
          }

          return errAsync(
            newIntegrationError({
              code: integrationErrorCodes.OIDC_USERINFO_FETCH_FAILED,
              details: {
                action,
                reason: `Failed to fetch /userinfo endpoint (HTTP ${status}).`,
              },
              isOperational: true,
              kind: httpStatusToKind(status),
            }),
          );
        }

        if (res.data.sub?.length === 0) {
          return errAsync(
            newIntegrationError({
              code: integrationErrorCodes.OIDC_USERINFO_SCHEMA_INVALID,
              details: {
                action,
                reason:
                  "IdP /userinfo payload does not contain a valid subject.",
              },
              i18n: { key: "errors.application.unauthorized" },
              isOperational: true,
              kind: "Unauthorized",
            }),
          );
        }

        return okAsync({
          name: res.data.name,
          email: res.data.email,
          emailVerified: res.data.email_verified === true,
          image: res.data.picture,
          subject: res.data.sub ?? "",
        });
      });
  };
}

function mapFetchError(
  cause: RichError,
  requestAction: string,
  decodeAction: string,
): RichError {
  if (cause.details?.action === "DeserializeResponseBody") {
    return newIntegrationError({
      cause,
      code: integrationErrorCodes.OIDC_USERINFO_PARSE_FAILED,
      details: {
        action: requestAction,
        reason: "Failed to parse /userinfo response.",
      },
      isOperational: true,
      kind: "Unauthorized",
    });
  }

  if (cause.details?.action === decodeAction) {
    return newIntegrationError({
      cause,
      code: integrationErrorCodes.OIDC_USERINFO_SCHEMA_INVALID,
      details: {
        action: requestAction,
        reason: "IdP /userinfo payload does not match expected schema.",
      },
      i18n: { key: "errors.application.unauthorized" },
      isOperational: true,
      kind: "Unauthorized",
    });
  }

  return newIntegrationError({
    cause,
    code: integrationErrorCodes.OIDC_USERINFO_FETCH_FAILED,
    details: {
      action: requestAction,
      reason: "Failed to fetch /userinfo endpoint.",
    },
    isOperational: true,
    kind: "Unavailable",
  });
}
