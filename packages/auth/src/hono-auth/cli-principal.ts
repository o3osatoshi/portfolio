import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import {
  newFetchError,
  newRichError,
  type RichError,
} from "@o3osatoshi/toolkit";

import {
  createOidcAccessTokenVerifier,
  parseScopes,
  verifyOidcAccessToken,
} from "./oidc-bearer";

export type CliPrincipal = {
  issuer: string;
  scopes: string[];
  subject: string;
  userId: string;
};

export type CreateCliPrincipalResolverOptions = {
  audience: string;
  checkIdentityProvisioningRateLimit?: (
    input: FindUserIdByIdentityInput,
  ) => ResultAsync<void, RichError>;
  fetchImpl?: typeof fetch;
  findUserIdByIdentity: (
    input: FindUserIdByIdentityInput,
  ) => ResultAsync<null | string, RichError>;
  issuer: string;
  resolveUserIdByIdentity: (
    input: ResolveUserIdByIdentityInput,
  ) => ResultAsync<string, RichError>;
};

export type ResolveCliPrincipalInput = {
  accessToken: string;
};

type FindUserIdByIdentityInput = {
  issuer: string;
  subject: string;
};

type ResolveUserIdByIdentityInput = {
  email?: string | undefined;
  emailVerified: boolean;
  image?: string | undefined;
  name?: string | undefined;
} & FindUserIdByIdentityInput;

const userInfoSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  email_verified: z.boolean().optional(),
  picture: z.string().optional(),
  sub: z.string(),
});

/**
 * Build a resolver that maps a CLI access token onto an internal user id.
 */
export function createCliPrincipalResolver(
  options: CreateCliPrincipalResolverOptions,
) {
  const verifyAccessToken = createOidcAccessTokenVerifier({
    audience: options.audience,
    issuer: options.issuer,
  });
  const fetchImpl = options.fetchImpl ?? fetch;

  return (
    input: ResolveCliPrincipalInput,
  ): ResultAsync<CliPrincipal, RichError> =>
    verifyOidcAccessToken(verifyAccessToken, input.accessToken).andThen(
      (claims) => {
        const scopes = parseScopes(claims.scope);
        const issuer = normalizeIssuer(claims.iss);
        const subject = claims.sub;

        return options
          .findUserIdByIdentity({ issuer, subject })
          .andThen((existingUserId) => {
            if (existingUserId) {
              return okAsync(existingUserId);
            }

            return (
              options.checkIdentityProvisioningRateLimit
                ? options.checkIdentityProvisioningRateLimit({
                    issuer,
                    subject,
                  })
                : okAsync(undefined)
            ).andThen(() =>
              fetchUserInfo({
                accessToken: input.accessToken,
                fetchImpl,
                issuer,
              }).andThen((userInfo) => {
                if (userInfo.sub !== subject) {
                  return errAsync(
                    newRichError({
                      code: "CLI_IDENTITY_SUB_MISMATCH",
                      details: {
                        action: "ResolveCliPrincipal",
                        reason:
                          "Access token subject does not match /userinfo subject.",
                      },
                      i18n: { key: "errors.application.unauthorized" },
                      isOperational: true,
                      kind: "Unauthorized",
                      layer: "External",
                    }),
                  );
                }

                return options.resolveUserIdByIdentity({
                  name: userInfo.name,
                  email: userInfo.email,
                  emailVerified: userInfo.email_verified === true,
                  image: userInfo.picture,
                  issuer,
                  subject,
                });
              }),
            );
          })
          .map((userId) => ({
            issuer,
            scopes,
            subject,
            userId,
          }));
      },
    );
}

function fetchUserInfo({
  accessToken,
  fetchImpl,
  issuer,
}: {
  accessToken: string;
  fetchImpl: typeof fetch;
  issuer: string;
}): ResultAsync<z.infer<typeof userInfoSchema>, RichError> {
  const normalizedIssuer = issuer.endsWith("/") ? issuer.slice(0, -1) : issuer;
  const userInfoUrl = `${normalizedIssuer}/userinfo`;

  return ResultAsync.fromPromise(
    fetchImpl(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "GET",
    }),
    (cause) =>
      newFetchError({
        cause,
        code: "CLI_USERINFO_FETCH_FAILED",
        details: {
          action: "FetchCliUserInfo",
        },
        request: {
          method: "GET",
          url: userInfoUrl,
        },
      }),
  )
    .andThen((response) =>
      response.ok
        ? ResultAsync.fromPromise(response.json(), (cause) =>
            newFetchError({
              cause,
              code: "CLI_USERINFO_PARSE_FAILED",
              details: {
                action: "ParseCliUserInfo",
                reason: "Failed to parse /userinfo response.",
              },
              request: {
                method: "GET",
                url: userInfoUrl,
              },
            }),
          )
        : errAsync(
            newRichError({
              code: "CLI_USERINFO_UNAUTHORIZED",
              details: {
                action: "FetchCliUserInfo",
                reason: "/userinfo request was rejected by the IdP.",
              },
              i18n: { key: "errors.application.unauthorized" },
              isOperational: true,
              kind: "Unauthorized",
              layer: "External",
            }),
          ),
    )
    .andThen((json) => {
      const parsed = userInfoSchema.safeParse(json);
      if (parsed.success) {
        return okAsync(parsed.data);
      }
      return errAsync(
        newRichError({
          cause: parsed.error,
          code: "CLI_USERINFO_SCHEMA_INVALID",
          details: {
            action: "ParseCliUserInfo",
            reason: "IdP /userinfo payload does not match expected schema.",
          },
          i18n: { key: "errors.application.unauthorized" },
          isOperational: true,
          kind: "Unauthorized",
          layer: "External",
        }),
      );
    });
}

function normalizeIssuer(issuer: string): string {
  return issuer.endsWith("/") ? issuer.slice(0, -1) : issuer;
}
