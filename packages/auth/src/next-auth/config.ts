import type { NextAuthConfig } from "next-auth";
import Auth0 from "next-auth/providers/auth0";

const oidcClientId = process.env["AUTH_OIDC_CLIENT_ID"];
const oidcClientSecret = process.env["AUTH_OIDC_CLIENT_SECRET"];
const oidcIssuer = process.env["AUTH_OIDC_ISSUER"];

// Shared NextAuth configuration (Edge-safe: no DB/adapter access here)
export const authConfig: NextAuthConfig = {
  providers: [
    Auth0({
      id: "oidc",
      // Keep disabled: do not auto-link accounts across providers by email.
      // Legacy-provider -> OIDC linking must be migrated explicitly.
      allowDangerousEmailAccountLinking: false,
      ...(oidcClientId ? { clientId: oidcClientId } : {}),
      ...(oidcClientSecret ? { clientSecret: oidcClientSecret } : {}),
      ...(oidcIssuer ? { issuer: oidcIssuer } : {}),
    }),
  ],
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
} satisfies NextAuthConfig;
