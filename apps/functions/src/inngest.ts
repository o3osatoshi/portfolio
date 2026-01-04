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
import { PrismaTransactionRepository } from "@repo/prisma";
import { onRequest } from "firebase-functions/v2/https";

import { env } from "./env";
import { getFunctionsLogger } from "./logger";
import { getPrismaClient } from "./prisma";

const INNGEST_APP_ID = "portfolio-functions";

let handler: ReturnType<typeof createInngestExpressHandler> | undefined;

export const inngest = onRequest(async (req, res) => {
  if (!handler) {
    const logger = getFunctionsLogger();

    if (!env.UPSTASH_REDIS_REST_TOKEN || !env.UPSTASH_REDIS_REST_URL) {
      throw new Error(
        "Missing UPSTASH_REDIS_REST_TOKEN/UPSTASH_REDIS_REST_URL",
      );
    }

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

    const prisma = getPrismaClient();
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
    });

    logger.info("Inngest handler initialized", { appId: INNGEST_APP_ID });
  }

  await handler(req, res);
});
