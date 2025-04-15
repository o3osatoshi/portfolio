import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

const clientId = process.env.AUTH_GOOGLE_ID;
const clientSecret = process.env.AUTH_GOOGLE_SECRET;
const secret = process.env.AUTH_SECRET;

if (
  clientId === undefined ||
  clientSecret === undefined ||
  secret === undefined
)
  throw new Error("missing required env params");

// https://authjs.dev/guides/edge-compatibility
export default {
  providers: [
    Google({
      clientId,
      clientSecret,
    }),
  ],
  secret,
  callbacks: {
    async jwt({ token, user }) {
      console.log("token", token);
      console.log("user", user);
      if (user !== undefined) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("session", session);
      console.log("token", token);
      if (session.user !== undefined && typeof token.id === "string") {
        session.user.id = token.id;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
