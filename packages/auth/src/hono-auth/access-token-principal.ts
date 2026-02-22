import type { ExternalIdentityResolver, UserId } from "@repo/domain";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import {
  newFetchError,
  newRichError,
  type RichError,
} from "@o3osatoshi/toolkit";

import { authErrorCodes } from "../auth-error-catalog";
import {
  createOidcAccessTokenVerifier,
  parseScopes,
  verifyOidcAccessToken,
} from "./oidc-bearer";

export type AccessTokenPrin = {
  issuer: string;
  scopes: string[];
  subject: string;
  userId: UserId;
};

export type CreateAccessTokenPrinResolverOptions = {
  audience: string;
  fetchImpl?: typeof fetch;
  findUserIdByKey: ExternalIdentityResolver["findUserIdByKey"];
  issuer: string;
  resolveUserId: ExternalIdentityResolver["resolveUserId"];
};

export type ResolveAccessTokenPrinParams = {
  accessToken: string;
};

const userInfoSchema = z.object({
  name: z.string().optional(),
  email: z.email().optional(),
  email_verified: z.boolean().optional(),
  picture: z.string().optional(),
  sub: z.string(),
});

/**
 * Build a resolver that maps an access token onto an internal user id.
 */
export function createAccessTokenPrinResolver(
  options: CreateAccessTokenPrinResolverOptions,
) {
  const verifyAccessToken = createOidcAccessTokenVerifier({
    audience: options.audience,
    issuer: options.issuer,
  });
  const fetchImpl = options.fetchImpl ?? fetch;

  return (
    params: ResolveAccessTokenPrinParams,
  ): ResultAsync<AccessTokenPrin, RichError> =>
    verifyOidcAccessToken(verifyAccessToken, params.accessToken).andThen(
      (claims) => {
        const scopes = parseScopes(claims.scope);
        const issuer = normalizeIssuer(claims.iss);
        const subject = claims.sub;

        return options
          .findUserIdByKey({ issuer, subject })
          .andThen((userId) => {
            if (userId) {
              return okAsync(userId);
            }

            return fetchUserInfo({
              accessToken: params.accessToken,
              fetchImpl,
              issuer,
            }).andThen((userInfo) => {
              if (userInfo.sub !== subject) {
                return errAsync(
                  newRichError({
                    code: authErrorCodes.OIDC_IDENTITY_SUB_MISMATCH,
                    details: {
                      action: "ResolveAccessTokenPrin",
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

              return options.resolveUserId({
                name: userInfo.name,
                email: userInfo.email,
                emailVerified: userInfo.email_verified === true,
                image: userInfo.picture,
                issuer,
                subject,
              });
            });
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
  const url = `${normalizedIssuer}/userinfo`;

  return ResultAsync.fromPromise(
    fetchImpl(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "GET",
    }),
    (cause) =>
      newFetchError({
        cause,
        code: authErrorCodes.OIDC_USERINFO_FETCH_FAILED,
        details: {
          action: "FetchUserInfo",
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
              code: authErrorCodes.OIDC_USERINFO_PARSE_FAILED,
              details: {
                action: "ParseUserInfo",
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
              code: authErrorCodes.OIDC_USERINFO_UNAUTHORIZED,
              details: {
                action: "FetchUserInfo",
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
      const result = userInfoSchema.safeParse(json);
      if (result.success) {
        return okAsync(result.data);
      }
      return errAsync(
        newRichError({
          cause: result.error,
          code: authErrorCodes.OIDC_USERINFO_SCHEMA_INVALID,
          details: {
            action: "ParseUserInfo",
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
