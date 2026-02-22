import "server-only";

import {
  createAccessTokenPrinResolver,
  type ResolveAccessTokenPrinParams,
} from "@repo/auth";
import { createPrismaClient, PrismaExternalIdentityStore } from "@repo/prisma";

import { env } from "@/env/server";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const externalIdentityStore = new PrismaExternalIdentityStore(client);

const resolver = createAccessTokenPrinResolver({
  audience: env.AUTH_OIDC_AUDIENCE,
  findUserIdByKey: (input) => externalIdentityStore.findUserIdByKey(input),
  issuer: env.AUTH_OIDC_ISSUER,
  linkByVerifiedEmail: (input) =>
    externalIdentityStore.linkByVerifiedEmail(input),
});

export function resolveAccessTokenPrin(input: ResolveAccessTokenPrinParams) {
  return resolver(input);
}
