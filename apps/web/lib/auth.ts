import { authConfig } from "@/lib/auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@repo/prisma";
import NextAuth from "next-auth";

const result = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});

export const { handlers } = result;
export const auth: typeof result.auth = result.auth;
