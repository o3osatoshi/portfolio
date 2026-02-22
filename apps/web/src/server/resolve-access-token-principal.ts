import "server-only";

import {
  createAccessTokenPrincipalResolver,
  type ResolveAccessTokenPrincipalInput,
} from "@repo/auth";
import { createPrismaClient, PrismaExternalIdentityStore } from "@repo/prisma";

import { env } from "@/env/server";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const externalIdentityStore = new PrismaExternalIdentityStore(client);

const resolver = createAccessTokenPrincipalResolver({
  audience: env.AUTH_OIDC_AUDIENCE,
  findUserIdByExternalIdentity: (input) =>
    externalIdentityStore.findUserIdByExternalKey(input),
  issuer: env.AUTH_OIDC_ISSUER,
  resolveUserIdByExternalIdentity: (input) =>
    externalIdentityStore.resolveUserId(input),
});

export function resolveAccessTokenPrincipal(
  input: ResolveAccessTokenPrincipalInput,
) {
  return resolver(input);
}
