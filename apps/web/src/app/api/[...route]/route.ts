import { createAuthConfig } from "@repo/auth";
import { buildHandler } from "@repo/interface/http/node";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";

import { env } from "@/env/server";

export const runtime = "nodejs";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const repo = new PrismaTransactionRepository(client);

const authConfig = createAuthConfig({
  providers: {
    google: {
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    },
  },
  prismaClient: client,
  secret: env.AUTH_SECRET,
});

export const { GET, POST } = buildHandler({
  authConfig,
  transactionRepo: repo,
});
