import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@repo/prisma";
import NextAuth from "next-auth";

import { authConfig } from "./config";

const result = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  ...authConfig,
});

export const { handlers } = result;

export async function getUserId(): Promise<string | undefined> {
  const session = await result.auth();
  return session?.user?.id;
}
