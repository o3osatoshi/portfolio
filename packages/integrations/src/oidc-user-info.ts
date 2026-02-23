import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import {
  newFetchError,
  newRichError,
  type RichError,
} from "@o3osatoshi/toolkit";

export const oidcUserInfoSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
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

const DEFAULT_OIDC_USERINFO_ACTION = "FetchUserInfo";
const DEFAULT_OIDC_USERINFO_PARSE_ACTION = "ParseUserInfo";

export type OidcUserInfo = z.infer<
  typeof oidcUserInfoToExternalIdentityClaimSetSchema
>;

export type OidcUserInfoFetcherErrorCodes = {
  fetchFailed: string;
  parseFailed: string;
  schemaInvalid: string;
  unauthorized: string;
};

export type OidcUserInfoFetcherInput = {
  accessToken: string;
  issuer: string;
};

export type OidcUserInfoFetcherOptions = {
  errorCodes: OidcUserInfoFetcherErrorCodes;
  fetch?: typeof fetch;
  parseAction?: string;
  requestAction?: string;
  unauthorizedReason?: string;
};

/**
 * Fetch and validate OIDC user info claims from a provider's userinfo endpoint.
 */
export function createOidcUserInfoFetcher(options: OidcUserInfoFetcherOptions) {
  const fetchImpl = options.fetch ?? fetch;
  const requestAction = options.requestAction ?? DEFAULT_OIDC_USERINFO_ACTION;
  const parseAction = options.parseAction ?? DEFAULT_OIDC_USERINFO_PARSE_ACTION;

  return (
    input: OidcUserInfoFetcherInput,
  ): ResultAsync<OidcUserInfo, RichError> => {
    const normalizedIssuer = input.issuer.endsWith("/")
      ? input.issuer.slice(0, -1)
      : input.issuer;
    const url = `${normalizedIssuer}/userinfo`;

    return ResultAsync.fromPromise(
      fetchImpl(url, {
        headers: {
          Authorization: `Bearer ${input.accessToken}`,
        },
        method: "GET",
      }),
      (cause) =>
        newFetchError({
          cause,
          code: options.errorCodes.fetchFailed,
          details: {
            action: requestAction,
          },
          request: {
            method: "GET",
            url,
          },
        }),
    )
      .andThen((res) =>
        res.ok
          ? ResultAsync.fromPromise(res.json(), (cause) =>
              newFetchError({
                cause,
                code: options.errorCodes.parseFailed,
                details: {
                  action: parseAction,
                  reason: "Failed to parse /userinfo response.",
                },
                request: {
                  method: "GET",
                  url,
                },
              }),
            )
          : errAsync(
              newRichError({
                code: options.errorCodes.unauthorized,
                details: {
                  action: requestAction,
                  reason:
                    options.unauthorizedReason ??
                    "/userinfo request was rejected by the IdP.",
                },
                i18n: { key: "errors.application.unauthorized" },
                isOperational: true,
                kind: "Unauthorized",
                layer: "External",
              }),
            ),
      )
      .andThen((json) => {
        const result =
          oidcUserInfoToExternalIdentityClaimSetSchema.safeParse(json);
        if (result.success) {
          return okAsync(result.data);
        }

        return errAsync(
          newRichError({
            cause: result.error,
            code: options.errorCodes.schemaInvalid,
            details: {
              action: parseAction,
              reason: "IdP /userinfo payload does not match expected schema.",
            },
            i18n: { key: "errors.application.unauthorized" },
            isOperational: true,
            kind: "Unauthorized",
            layer: "External",
          }),
        );
      });
  };
}
