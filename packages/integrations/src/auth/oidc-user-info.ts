import { errAsync, okAsync, type ResultAsync } from "neverthrow";
import { z } from "zod";

import type { RichError } from "@o3osatoshi/toolkit";

import { createSmartFetch } from "../http";
import { newIntegrationError } from "../integration-error";
import { integrationErrorCodes } from "../integration-error-catalog";

export const oidcUserInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  email_verified: z.boolean().optional(),
  picture: z.string().optional(),
  sub: z.string(),
});

const oidcUserInfoToExternalIdentityClaimSetSchema =
  oidcUserInfoSchema.transform((value) => ({
    name: value.name,
    email: value.email,
    emailVerified: value.email_verified === true,
    image: value.picture,
    subject: value.sub,
  }));

const DEFAULT_OIDC_USERINFO_REQUEST_ACTION = "FetchOidcUserInfo";
const DEFAULT_OIDC_USERINFO_DECODE_BODY_ACTION = "DecodeOidcUserInfoBody";

export type OidcUserInfo = z.infer<
  typeof oidcUserInfoToExternalIdentityClaimSetSchema
>;

export type OidcUserInfoFetcherInput = {
  accessToken: string;
  issuer: string;
};

export type OidcUserInfoFetcherOptions = {
  fetch?: typeof fetch;
  unauthorizedReason?: string;
};

/**
 * Fetch and validate OIDC user info claims from a provider's userinfo endpoint.
 */
export function createOidcUserInfoFetcher(options: OidcUserInfoFetcherOptions) {
  const fetchImpl = options.fetch ?? fetch;
  const requestAction = DEFAULT_OIDC_USERINFO_REQUEST_ACTION;
  const unauthorizedReason =
    options.unauthorizedReason ?? "/userinfo request was rejected by the IdP.";
  const sFetch = createSmartFetch({ fetch: fetchImpl });

  return (
    input: OidcUserInfoFetcherInput,
  ): ResultAsync<OidcUserInfo, RichError> => {
    const normalizedIssuer = input.issuer.endsWith("/")
      ? input.issuer.slice(0, -1)
      : input.issuer;
    const url = `${normalizedIssuer}/userinfo`;

    return sFetch({
      decode: {
        context: {
          action: DEFAULT_OIDC_USERINFO_DECODE_BODY_ACTION,
          layer: "External",
        },
        schema: z.unknown(),
      },
      headers: {
        Authorization: `Bearer ${input.accessToken}`,
      },
      method: "GET",
      url,
    })
      .orElse((cause) => errAsync(mapFetchError(cause, requestAction)))
      .andThen((res) => {
        if (!res.response.ok) {
          return errAsync(
            newIntegrationError({
              code: integrationErrorCodes.OIDC_USERINFO_UNAUTHORIZED,
              details: {
                action: requestAction,
                reason: unauthorizedReason,
              },
              i18n: { key: "errors.application.unauthorized" },
              isOperational: true,
              kind: "Unauthorized",
            }),
          );
        }

        const result = oidcUserInfoToExternalIdentityClaimSetSchema.safeParse(
          res.data,
        );
        if (result.success) {
          return okAsync(result.data);
        }

        return errAsync(
          newIntegrationError({
            cause: result.error,
            code: integrationErrorCodes.OIDC_USERINFO_SCHEMA_INVALID,
            details: {
              action: requestAction,
              reason: "IdP /userinfo payload does not match expected schema.",
            },
            i18n: { key: "errors.application.unauthorized" },
            isOperational: true,
            kind: "Unauthorized",
          }),
        );
      });
  };
}

function mapFetchError(cause: RichError, requestAction: string): RichError {
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
