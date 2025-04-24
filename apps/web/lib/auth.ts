import authConfig from "@/lib/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@repo/db";
import NextAuth from "next-auth";

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});
export const handlers = nextAuth.handlers;
export const auth: typeof nextAuth.auth = nextAuth.auth;
