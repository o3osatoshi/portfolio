import { err, ok, type Result } from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import { authErrorCodes } from "../auth-error-catalog";

type AccessTokenPrincipalLike = {
  scopes: readonly string[];
};

/**
 * Authorize an access token principal against a required scope.
 *
 * @param principal Principal resolved from the incoming token.
 * @param requiredScope Scope that must be present in `principal.scopes`.
 * @returns The same principal when authorized, otherwise `AUTH_SCOPE_FORBIDDEN`.
 * @public
 */
export function authorizeScope<T extends AccessTokenPrincipalLike>(
  principal: T | undefined,
  requiredScope: string,
): Result<T, RichError> {
  if (principal === undefined) {
    return err(
      newRichError({
        code: authErrorCodes.ACCESS_SCOPE_FORBIDDEN,
        details: {
          action: "AuthorizeScope",
          reason: "Access token principal is missing.",
        },
        i18n: { key: "errors.application.forbidden" },
        isOperational: true,
        kind: "Forbidden",
        layer: "Presentation",
      }),
    );
  }

  if (principal.scopes.includes(requiredScope)) {
    return ok(principal);
  }

  return err(
    newRichError({
      code: authErrorCodes.ACCESS_SCOPE_FORBIDDEN,
      details: {
        action: "AuthorizeScope",
        reason: `Required scope is missing: ${requiredScope}`,
      },
      i18n: { key: "errors.application.forbidden" },
      isOperational: true,
      kind: "Forbidden",
      layer: "Presentation",
    }),
  );
}

/**
 * Extract the Bearer token from an Authorization header value.
 *
 * @param authorization `Authorization` header from the request.
 * @returns Raw token when header is present and follows `Bearer <token>`.
 * @remarks Errors:
 * - `AUTHORIZATION_HEADER_MISSING` if the header is empty.
 * - `AUTHORIZATION_HEADER_MALFORMED` if the header is not Bearer-shaped.
 * @public
 */
export function extractBearerToken(
  authorization: null | string | undefined,
): Result<string, RichError> {
  if (!authorization) {
    return err(
      newRichError({
        code: authErrorCodes.AUTHORIZATION_HEADER_MISSING,
        details: {
          action: "ExtractBearerToken",
          reason: "Authorization header is missing.",
        },
        i18n: { key: "errors.application.unauthorized" },
        isOperational: true,
        kind: "Unauthorized",
        layer: "Presentation",
      }),
    );
  }

  const matched = authorization.match(/^Bearer\s+(.+)$/i);
  if (!matched || !matched[1]) {
    return err(
      newRichError({
        code: authErrorCodes.AUTHORIZATION_HEADER_MALFORMED,
        details: {
          action: "ExtractBearerToken",
          reason: "Authorization header must use Bearer scheme.",
        },
        i18n: { key: "errors.application.unauthorized" },
        isOperational: true,
        kind: "Unauthorized",
        layer: "Presentation",
      }),
    );
  }

  return ok(matched[1]);
}
