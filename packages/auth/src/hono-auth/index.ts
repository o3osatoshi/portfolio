import type { OAuthConfig } from "@auth/core/providers";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AuthConfig } from "@hono/auth-js";
import type { PrismaClient } from "@repo/prisma";

import type { AuthProviderId, AuthUser } from "./types";

export type CreateAuthConfigOptions = {
  basePath?: string;
  prismaClient?: PrismaClient;
  providers?: Record<AuthProviderId, OidcProviderConfig>;
  secret: string;
  /**
   * Session strategy. This repo defaults to JWT sessions and does not use the
   * database session table. If you switch to database sessions, store a hash or
   * encrypted form of session tokens in the adapter.
   */
  session?: { strategy?: "database" | "jwt" };
};

type OidcProviderConfig = {
  clientId: string;
  clientSecret: string;
  issuer: string;
  scope?: string | undefined;
};

/**
 * Compose an Auth.js configuration object for the Hono middleware.
 *
 * This helper wires up the Prisma adapter (when provided), configures an OIDC
 * provider, and installs opinionated JWT / session callbacks
 * that persist a stable `user.id` onto the token.
 *
 * @param options High-level options for auth setup (providers, secret, etc.).
 * @returns Auth configuration object compatible with `@hono/auth-js`.
 *
 * @public
 */
export function createAuthConfig(options: CreateAuthConfigOptions): AuthConfig {
  return {
    ...(options.prismaClient && {
      adapter: PrismaAdapter(options.prismaClient),
    }),
    providers: options.providers
      ? [buildOidcProvider(options.providers.oidc)]
      : [],
    basePath: options.basePath ?? "/api/auth",
    callbacks: {
      async jwt({ token, user }) {
        if (user !== undefined) {
          token["id"] = user.id;
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user !== undefined && typeof token["id"] === "string") {
          session.user.id = token["id"];
        }
        return session;
      },
    },
    secret: options.secret,
    session: { strategy: options.session?.strategy ?? "jwt" },
  };
}

export function getAuthUserId(authUser?: AuthUser): string | undefined {
  return authUser?.session?.user?.id ?? authUser?.user?.id;
}

export type { AuthConfig };
export * from "./cli-principal";
export * from "./jwt";
export * from "./oidc-bearer";
export * from "./types";

function buildOidcProvider(
  config: OidcProviderConfig,
): OAuthConfig<Record<string, unknown>> {
  return {
    id: "oidc",
    name: "OIDC",
    allowDangerousEmailAccountLinking: true,
    authorization: {
      params: {
        scope: config.scope ?? "openid profile email",
      },
    },
    checks: ["pkce", "state", "nonce"],
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    issuer: config.issuer,
    profile(profile) {
      return {
        id: String(profile["sub"] ?? ""),
        name: toOptionalString(profile["name"]),
        email: toOptionalString(profile["email"]),
        image: toOptionalString(profile["picture"]),
      };
    },
    type: "oidc",
  };
}

function toOptionalString(input: unknown): null | string {
  return typeof input === "string" ? input : null;
}
