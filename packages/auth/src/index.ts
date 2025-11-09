import { PrismaAdapter } from "@auth/prisma-adapter";
import type { PrismaClient } from "@repo/prisma";
import NextAuth, { type NextAuthConfig } from "next-auth";

import { authConfig } from "./config";

export type CreateAuthOptions = {
  config?: Partial<NextAuthConfig>;
  prisma: PrismaClient;
};

export function createAuth(options: CreateAuthOptions) {
  const result = NextAuth({
    adapter: PrismaAdapter(options.prisma),
    session: { strategy: "jwt" },
    ...authConfig,
    ...(options.config ?? {}),
  });

  async function getUserId(): Promise<string | undefined> {
    const session = await result.auth();
    return session?.user?.id;
  }

  return { ...result, getUserId };
}
