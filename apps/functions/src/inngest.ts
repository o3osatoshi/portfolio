import {
  createSlackClient,
  createSlackNotifier,
  createUpstashRedis,
} from "@repo/integrations";
import {
  createInngestClient,
  createInngestExpressHandler,
  createInngestFunctions,
} from "@repo/interface/inngest";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
import { onRequest } from "firebase-functions/v2/https";

import { env } from "./env";
import { getFunctionsLogger } from "./logger";

const INNGEST_APP_ID = "portfolio-functions";

let handler: ReturnType<typeof createInngestExpressHandler> | undefined;

export const inngest = onRequest(async (req, res) => {
  if (!handler) {
    const logger = getFunctionsLogger();

    const cacheStore = createUpstashRedis({
      token: env.UPSTASH_REDIS_REST_TOKEN,
      url: env.UPSTASH_REDIS_REST_URL,
    });

    const slackClient = createSlackClient({
      token: env.SLACK_BOT_TOKEN,
    });
    const slackNotifier = createSlackNotifier({
      channelId: env.SLACK_CHANNEL_ID,
      client: slackClient,
    });

    const prisma = createPrismaClient({
      connectionString: env.DATABASE_URL,
    });
    const transactionRepo = new PrismaTransactionRepository(prisma);

    const inngestClient = createInngestClient({
      id: INNGEST_APP_ID,
      eventKey: env.INNGEST_EVENT_KEY,
    });

    const functions = createInngestFunctions(inngestClient, {
      storePing: {
        cache: cacheStore,
        notifier: slackNotifier,
        transactionRepo,
        userId: env.STORE_PING_USER_ID,
      },
    });

    handler = createInngestExpressHandler({
      client: inngestClient,
      functions,
      signingKey: env.INNGEST_SIGNING_KEY,
    });

    logger.info("Inngest handler initialized", { appId: INNGEST_APP_ID });
  }

  await handler(req, res);
});
