import type { ExternalIdentityResolver, UserId } from "@repo/domain";
import { createOidcUserInfoFetcher } from "@repo/integrations";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import { authErrorCodes } from "../auth-error-catalog";
import {
  createOidcAccessTokenVerifier,
  parseScopes,
} from "./oidc-access-token";

export type AccessTokenPrincipal = {
  issuer: string;
  scopes: string[];
  subject: string;
  userId: UserId;
};

export type CreateAccessTokenPrincipalResolverOptions = {
  audience: string;
  fetchImpl?: typeof fetch;
  findUserIdByKey: ExternalIdentityResolver["findUserIdByKey"];
  issuer: string;
  linkExternalIdentityToUserByEmail: ExternalIdentityResolver["linkExternalIdentityToUserByEmail"];
};

export type ResolveAccessTokenPrincipalParams = {
  accessToken: string;
};

/**
 * Build a resolver that maps an access token onto an internal user id.
 */
export function createAccessTokenPrincipalResolver(
  options: CreateAccessTokenPrincipalResolverOptions,
) {
  const verifyAccessToken = createOidcAccessTokenVerifier({
    audience: options.audience,
    issuer: options.issuer,
  });
  const fetchUserInfo = createOidcUserInfoFetcher({
    fetch: options.fetchImpl ?? fetch,
    unauthorizedReason: "/userinfo request was rejected by the IdP.",
  });

  return (
    params: ResolveAccessTokenPrincipalParams,
  ): ResultAsync<AccessTokenPrincipal, RichError> =>
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
          })
            .andThen((userInfo) => {
              if (userInfo.subject !== subject) {
                return errAsync(
                  newRichError({
                    code: authErrorCodes.OIDC_IDENTITY_SUB_MISMATCH,
                    details: {
                      action: "ResolveAccessTokenPrincipal",
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
                ...userInfo,
                issuer,
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
