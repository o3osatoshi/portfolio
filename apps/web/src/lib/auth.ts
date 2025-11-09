import { createAuth } from "@repo/auth";
import { createPrismaClient } from "@repo/prisma";

import { env } from "@/env/server";

const prisma = createPrismaClient({ connectionString: env.DATABASE_URL });

export const { auth, getUserId, handlers } = createAuth({ prisma });
