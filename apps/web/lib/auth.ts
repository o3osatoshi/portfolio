import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/client";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";

const nextAuth = NextAuth({
  // @ts-ignore
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});

export const handlers = nextAuth.handlers;
export const auth: typeof nextAuth.auth = nextAuth.auth;
