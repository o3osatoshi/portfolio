import { createRemoteJWKSet, jwtVerify } from "jose";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

export type OidcAccessTokenClaims = {
  [key: string]: unknown;
  aud?: string | string[] | undefined;
  email?: string | undefined;
  email_verified?: boolean | undefined;
  exp?: number | undefined;
  iat?: number | undefined;
  iss: string;
  nbf?: number | undefined;
  picture?: string | undefined;
  scope?: string | undefined;
  sub: string;
};

export type OidcAccessTokenVerifier = (
  token: string,
) => ResultAsync<OidcAccessTokenClaims, RichError>;

export type OidcAccessTokenVerifierOptions = {
  audience: string;
  clockToleranceSeconds?: number | undefined;
  issuer: string;
  jwksUri?: string | undefined;
};

const jwtVerifyFailureSchema = z.object({
  name: z.string().optional(),
  code: z.string().optional(),
  message: z.string().optional(),
});

/**
 * Create a verifier for OIDC access tokens issued for this API.
 */
export function createOidcAccessTokenVerifier(
  options: OidcAccessTokenVerifierOptions,
): OidcAccessTokenVerifier {
  const issuer = normalizeIssuer(options.issuer);
  const jwksUri = options.jwksUri ?? `${issuer}/.well-known/jwks.json`;
  const jwkSet = createRemoteJWKSet(new URL(jwksUri));
  const issuers = [issuer, `${issuer}/`];

  return (token: string) =>
    ResultAsync.fromPromise(
      jwtVerify(token, jwkSet, {
        audience: options.audience,
        clockTolerance: options.clockToleranceSeconds ?? 60,
        issuer: issuers,
      }),
      (cause) => {
        const { code, reason } = classifyJwtVerifyFailure(cause);
        return newRichError({
          cause,
          code,
          details: {
            action: "VerifyOidcAccessToken",
            reason,
          },
          i18n: { key: "errors.application.unauthorized" },
          isOperational: true,
          kind: "Unauthorized",
          layer: "External",
        });
      },
    ).andThen(({ payload }) => {
      const claims = payload as Partial<OidcAccessTokenClaims>;
      if (typeof claims.iss !== "string" || typeof claims.sub !== "string") {
        return errAsync(
          newRichError({
            code: "OIDC_ACCESS_TOKEN_CLAIMS_INVALID",
            details: {
              action: "VerifyOidcAccessToken",
              reason: "Access token is missing required claims.",
            },
            i18n: { key: "errors.application.unauthorized" },
            isOperational: true,
            kind: "Unauthorized",
            layer: "External",
          }),
        );
      }

      if (normalizeIssuer(claims.iss) !== issuer) {
        return errAsync(
          newRichError({
            code: "OIDC_ACCESS_TOKEN_ISSUER_MISMATCH",
            details: {
              action: "VerifyOidcAccessToken",
              reason: "Access token issuer does not match this API.",
            },
            i18n: { key: "errors.application.unauthorized" },
            isOperational: true,
            kind: "Unauthorized",
            layer: "External",
          }),
        );
      }

      const normalizedAud = normalizeAudience(claims.aud);
      if (!normalizedAud.includes(options.audience)) {
        return errAsync(
          newRichError({
            code: "OIDC_ACCESS_TOKEN_AUDIENCE_MISMATCH",
            details: {
              action: "VerifyOidcAccessToken",
              reason: "Access token audience does not match this API.",
            },
            i18n: { key: "errors.application.unauthorized" },
            isOperational: true,
            kind: "Unauthorized",
            layer: "External",
          }),
        );
      }

      return okAsync(claims as OidcAccessTokenClaims);
    });
}

/**
 * Parse a scope claim into distinct scope names.
 */
export function parseScopes(scopeClaim: unknown): string[] {
  if (typeof scopeClaim !== "string") return [];
  return [
    ...new Set(
      scopeClaim
        .split(" ")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];
}

/**
 * Verify an OIDC access token using a verifier returned by
 * {@link createOidcAccessTokenVerifier}.
 */
export function verifyOidcAccessToken(
  verifier: OidcAccessTokenVerifier,
  token: string,
) {
  return verifier(token);
}

function classifyJwtVerifyFailure(cause: unknown): {
  code: string;
  reason: string;
} {
  const result = jwtVerifyFailureSchema.safeParse(cause);
  const code = result.success ? (result.data.code ?? "") : "";
  const name = result.success ? (result.data.name ?? "") : "";
  const message = cause instanceof Error ? cause.message : "";

  if (
    name === "JWTExpired" ||
    code === "ERR_JWT_EXPIRED" ||
    message.includes('"exp" claim timestamp check failed')
  ) {
    return {
      code: "OIDC_ACCESS_TOKEN_EXPIRED",
      reason: "Access token has expired.",
    };
  }

  if (
    name === "JWTClaimValidationFailed" &&
    message.includes('unexpected "aud" claim value')
  ) {
    return {
      code: "OIDC_ACCESS_TOKEN_AUDIENCE_MISMATCH",
      reason: "Access token audience does not match this API.",
    };
  }

  return {
    code: "OIDC_ACCESS_TOKEN_INVALID",
    reason: "Access token verification failed.",
  };
}

function normalizeAudience(aud: unknown): string[] {
  if (Array.isArray(aud)) {
    return aud.filter((v): v is string => typeof v === "string");
  }
  if (typeof aud === "string") return [aud];
  return [];
}

function normalizeIssuer(issuer: string): string {
  return issuer.endsWith("/") ? issuer.slice(0, -1) : issuer;
}
