import Google from "@auth/core/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AuthConfig } from "@hono/auth-js";
import type { PrismaClient } from "@repo/prisma";

import type { AuthProviderId } from "./types";

export type CreateAuthConfigOptions = {
  basePath?: string;
  prismaClient: PrismaClient;
  providers: {
    [key in AuthProviderId]: {
      clientId: string;
      clientSecret: string;
    };
  };
  secret: string;
};

export function createAuthConfig(options: CreateAuthConfigOptions): AuthConfig {
  return {
    providers: [
      Google({
        clientId: options.providers.google.clientId,
        clientSecret: options.providers.google.clientSecret,
      }),
    ],
    adapter: PrismaAdapter(options.prismaClient),
    basePath: options.basePath ?? "/api/auth",
    secret: options.secret,
  };
}

export type { AuthConfig };
