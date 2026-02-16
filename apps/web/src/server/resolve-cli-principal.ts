import "server-only";

import {
  createCliPrincipalResolver,
  type ResolveCliPrincipalInput,
} from "@repo/auth";
import { createPrismaClient, PrismaUserIdentityStore } from "@repo/prisma";

import { env } from "@/env/server";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const userIdentityStore = new PrismaUserIdentityStore(client);

const resolver = createCliPrincipalResolver({
  audience: env.AUTH_OIDC_AUDIENCE,
  findUserIdByIdentity: (input) =>
    userIdentityStore.findUserIdByIssuerSubject(input),
  issuer: env.AUTH_OIDC_ISSUER,
  resolveUserIdByIdentity: (input) => userIdentityStore.resolveUserId(input),
});

export function resolveCliPrincipal(input: ResolveCliPrincipalInput) {
  return resolver(input);
}
