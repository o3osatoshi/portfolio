import "server-only";

import {
  createAccessTokenPrincipalResolver,
  type ResolveAccessTokenPrincipalParams,
} from "@repo/auth";
import { createPrismaClient, PrismaExternalIdentityStore } from "@repo/prisma";

import { env } from "@/env/server";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const externalIdentityStore = new PrismaExternalIdentityStore(client);

const resolver = createAccessTokenPrincipalResolver({
  audience: env.AUTH_OIDC_AUDIENCE,
  findUserIdByKey: (input) => externalIdentityStore.findUserIdByKey(input),
  issuer: env.AUTH_OIDC_ISSUER,
  linkExternalIdentityToUserByEmail: (input) =>
    externalIdentityStore.linkExternalIdentityToUserByEmail(input),
});

export function resolveAccessTokenPrincipal(
  input: ResolveAccessTokenPrincipalParams,
) {
  return resolver(input);
}
