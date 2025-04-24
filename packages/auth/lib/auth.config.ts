import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// https://authjs.dev/guides/edge-compatibility
export const authConfig = {
  providers: [Google],
  callbacks: {
    async jwt({ token, user }) {
      if (user !== undefined) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user !== undefined && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
