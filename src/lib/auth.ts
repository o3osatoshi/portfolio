import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

const clientId = process.env.AUTH_GOOGLE_ID;
const clientSecret = process.env.AUTH_GOOGLE_SECRET;
const secret = process.env.NEXTAUTH_SECRET;

if (
  clientId === undefined ||
  clientSecret === undefined ||
  secret === undefined
)
  throw new Error("missing required env params");

export const { handlers, signIn, signOut, auth } = NextAuth({
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
      return token;
    },
    async session({ session, token }) {
      console.log("session", session);
      console.log("token", token);
      return session;
    },
  },
});
