import { createRemoteJWKSet, jwtVerify } from "jose";
import { errAsync, okAsync, ResultAsync } from "neverthrow";

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

/**
 * Create a verifier for OIDC access tokens issued for this API.
 */
export function createOidcAccessTokenVerifier(
  options: OidcAccessTokenVerifierOptions,
): OidcAccessTokenVerifier {
  const issuer = normalizeIssuer(options.issuer);
  const jwksUri = options.jwksUri ?? `${issuer}/.well-known/jwks.json`;
  const jwks = createRemoteJWKSet(new URL(jwksUri));
  const clockToleranceSeconds = options.clockToleranceSeconds ?? 60;

  return (token: string) =>
    ResultAsync.fromPromise(
      jwtVerify(token, jwks, {
        audience: options.audience,
        clockTolerance: clockToleranceSeconds,
        issuer,
      }),
      (cause) =>
        newRichError({
          cause,
          code: "OIDC_ACCESS_TOKEN_INVALID",
          details: {
            action: "VerifyOidcAccessToken",
            reason: "Access token verification failed.",
          },
          i18n: { key: "errors.application.unauthorized" },
          isOperational: true,
          kind: "Unauthorized",
          layer: "External",
        }),
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
