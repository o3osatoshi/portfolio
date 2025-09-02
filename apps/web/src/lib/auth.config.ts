import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// https://authjs.dev/guides/edge-compatibilitye
export const authConfig: NextAuthConfig = {
  providers: [Google],
  callbacks: {
    async jwt({ token, user }) {
      if (user !== undefined) {
        // biome-ignore lint/complexity/useLiteralKeys: prioritize TS4111
        token["id"] = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // biome-ignore lint/complexity/useLiteralKeys: prioritize TS4111
      if (session.user !== undefined && typeof token["id"] === "string") {
        // biome-ignore lint/complexity/useLiteralKeys: prioritize TS4111
        session.user.id = token["id"];
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
