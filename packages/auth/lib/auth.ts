import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@repo/db";
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const nextAuth = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});

export const handlers = nextAuth.handlers;
export const auth: typeof nextAuth.auth = nextAuth.auth;
