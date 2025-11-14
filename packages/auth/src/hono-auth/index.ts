import Google from "@auth/core/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AuthConfig } from "@hono/auth-js";
import type { PrismaClient } from "@repo/prisma";

import type { AuthProviderId } from "./types";

export type CreateAuthConfigOptions = {
  basePath?: string;
  prismaClient?: PrismaClient;
  providers?: {
    [key in AuthProviderId]: {
      clientId: string;
      clientSecret: string;
    };
  };
  secret: string;
  session?: { strategy?: "database" | "jwt" };
};

export function createAuthConfig(options: CreateAuthConfigOptions): AuthConfig {
  return {
    ...(options.prismaClient && {
      adapter: PrismaAdapter(options.prismaClient),
    }),
    providers: [
      ...(options.providers
        ? [
            Google({
              clientId: options.providers.google.clientId,
              clientSecret: options.providers.google.clientSecret,
            }),
          ]
        : []),
    ],
    basePath: options.basePath ?? "/api/auth",
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
    secret: options.secret,
    session: { strategy: options?.session?.strategy ?? "jwt" },
  };
}

export type { AuthConfig };
export * from "./types";
