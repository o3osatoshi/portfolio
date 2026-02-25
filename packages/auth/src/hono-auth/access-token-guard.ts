import { err, ok, type Result } from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import { authErrorCodes } from "../auth-error-catalog";

const DEFAULT_MISSING_BEARER_REASON = "Authorization header is missing.";
const DEFAULT_MALFORMED_BEARER_REASON =
  "Authorization header must use Bearer scheme.";
const DEFAULT_SCOPE_MISSING_REASON = "Access token principal is missing.";

type AccessTokenPrincipalLike = {
  scopes: readonly string[];
};

export function extractBearerToken(
  authorization: null | string | undefined,
): Result<string, RichError> {
  if (!authorization) {
    return err(
      newRichError({
        code: authErrorCodes.AUTHORIZATION_HEADER_MISSING,
        details: {
          action: "ExtractBearerToken",
          reason: DEFAULT_MISSING_BEARER_REASON,
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
          reason: DEFAULT_MALFORMED_BEARER_REASON,
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

export function requireScope<T extends AccessTokenPrincipalLike>(
  principal: T | undefined,
  requiredScope: string,
): Result<T, RichError> {
  if (principal === undefined) {
    return err(
      newRichError({
        code: authErrorCodes.ACCESS_SCOPE_FORBIDDEN,
        details: {
          action: "AuthorizeScope",
          reason: DEFAULT_SCOPE_MISSING_REASON,
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
