import Google from "@auth/core/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { buildHandler } from "@repo/interface/http/node";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";

import { env } from "@/env/server";

export const runtime = "nodejs";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const repo = new PrismaTransactionRepository(client);

export const { GET, POST } = buildHandler({
  authConfig: {
    providers: [
      Google({
        clientId: env.AUTH_GOOGLE_ID,
        clientSecret: env.AUTH_GOOGLE_SECRET,
      }),
    ],
    adapter: PrismaAdapter(client),
    basePath: "/api/auth",
    secret: env.AUTH_SECRET,
  },
  transactionRepo: repo,
});
