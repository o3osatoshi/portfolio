import type { ExternalIdentityResolver, UserId } from "@repo/domain";
import { createOidcUserInfoFetcher } from "@repo/integrations";
import { errAsync, okAsync, type ResultAsync } from "neverthrow";

import {
  newRichError,
  type RichError,
  trimTrailingSlash,
} from "@o3osatoshi/toolkit";

import { authErrorCodes } from "../auth-error-catalog";
import {
  createOidcAccessTokenVerifier,
  parseScopes,
} from "./oidc-access-token";

/**
 * Principal derived from a verified access token.
 *
 * - `issuer`: normalized OIDC issuer URL (trailing slash trimmed).
 * - `subject`: subject from the OIDC token (`sub`) and IdP identity linkage key.
 * - `userId`: canonical repository `UserId` resolved or linked through external identity.
 * - `scopes`: space-separated scope list parsed from the token claim.
 *
 * @public
 */
export type AccessTokenPrincipal = {
  issuer: string;
  scopes: string[];
  subject: string;
  userId: UserId;
};

/**
 * Options required to build an access-token principal resolver.
 *
 * - `findUserIdByKey`: resolves an existing principal by `(issuer, subject)`.
 * - `linkExternalIdentityToUserByEmail`: creates missing identity mapping when a
 *   token is valid but no principal exists yet.
 * - `fetchImpl`: optional fetch implementation for test/runtime override.
 *
 * @public
 */
export type CreateAccessTokenPrincipalResolverOptions = {
  audience: string;
  fetchImpl?: typeof fetch;
  findUserIdByKey: ExternalIdentityResolver["findUserIdByKey"];
  issuer: string;
  linkExternalIdentityToUserByEmail: ExternalIdentityResolver["linkExternalIdentityToUserByEmail"];
};

/**
 * Input to `createAccessTokenPrincipalResolver` output function.
 *
 * @public
 */
export type ResolveAccessTokenPrincipalParams = {
  accessToken: string;
};

/**
 * Build a resolver that maps a token to an `AccessTokenPrincipal`.
 *
 * Steps:
 * 1. Verify and parse the OIDC access token.
 * 2. Resolve an existing `UserId` by `(issuer, subject)`.
 * 3. If missing, fetch `/userinfo`, validate subject match, then
 *    `linkExternalIdentityToUserByEmail` to provision mapping.
 *
 * Failure mapping:
 * - OIDC verification failures use `OIDC_*` errors from the verifier.
 * - Missing subject match returns `OIDC_IDENTITY_SUB_MISMATCH`.
 * - `linkExternalIdentityToUserByEmail` / fetch errors are propagated.
 *
 * @param options Resolver dependencies and policy.
 * @returns A function that resolves the caller to `AccessTokenPrincipal`.
 * @public
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
      const issuer = trimTrailingSlash(claimSet.iss);
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
