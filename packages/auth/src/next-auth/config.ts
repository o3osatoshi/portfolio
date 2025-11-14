import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

// Shared NextAuth configuration (Edge-safe: no DB/adapter access here)
export const authConfig: NextAuthConfig = {
  providers: [Google],
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
