import "server-only";

import {
  createCliPrincipalResolver,
  type ResolveCliPrincipalInput,
} from "@repo/auth";
import { createPrismaClient, PrismaExternalIdentityStore } from "@repo/prisma";

import { env } from "@/env/server";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const externalIdentityStore = new PrismaExternalIdentityStore(client);

const resolver = createCliPrincipalResolver({
  audience: env.AUTH_OIDC_AUDIENCE,
  findUserIdByIdentity: (input) =>
    externalIdentityStore.findUserIdByExternalKey(input),
  issuer: env.AUTH_OIDC_ISSUER,
  resolveUserIdByIdentity: (input) => externalIdentityStore.resolveUserId(input),
});

export function resolveCliPrincipal(input: ResolveCliPrincipalInput) {
  return resolver(input);
}
