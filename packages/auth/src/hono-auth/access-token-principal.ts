import type { ExternalIdentityResolver, UserId } from "@repo/domain";
import { createOidcUserInfoFetcher } from "@repo/integrations";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import { authErrorCodes } from "../auth-error-catalog";
import {
  createOidcAccessTokenVerifier,
  parseScopes,
} from "./oidc-access-token";

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
  linkExternalIdentityToUserByEmail: ExternalIdentityResolver["linkExternalIdentityToUserByEmail"];
};

export type ResolveAccessTokenPrinParams = {
  accessToken: string;
};

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
  const fetchUserInfo = createOidcUserInfoFetcher({
    errorCodes: {
      schemaInvalid: authErrorCodes.OIDC_USERINFO_SCHEMA_INVALID,
      fetchFailed: authErrorCodes.OIDC_USERINFO_FETCH_FAILED,
      parseFailed: authErrorCodes.OIDC_USERINFO_PARSE_FAILED,
      unauthorized: authErrorCodes.OIDC_USERINFO_UNAUTHORIZED,
    },
    fetch: fetchImpl,
    unauthorizedReason: "/userinfo request was rejected by the IdP.",
  });

  return (
    params: ResolveAccessTokenPrinParams,
  ): ResultAsync<AccessTokenPrin, RichError> =>
    verifyAccessToken(params.accessToken).andThen((claimSet) => {
      const scopes = parseScopes(claimSet.scope);
      const issuer = normalizeIssuer(claimSet.iss);
      const subject = claimSet.sub;

      return options
        .findUserIdByKey({ issuer, subject })
        .andThen((userId) => {
          if (userId) {
            return okAsync(userId);
          }

          return fetchUserInfo({
            accessToken: params.accessToken,
            issuer,
          }).andThen((userInfo) => {
            if (userInfo.subject !== subject) {
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

            return options.linkExternalIdentityToUserByEmail({
              name: userInfo.name,
              email: userInfo.email,
              emailVerified: userInfo.emailVerified,
              image: userInfo.image,
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
    });
}

function normalizeIssuer(issuer: string): string {
  return issuer.endsWith("/") ? issuer.slice(0, -1) : issuer;
}
