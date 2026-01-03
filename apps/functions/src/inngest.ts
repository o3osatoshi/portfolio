import { StorePingUseCase } from "@repo/application";
import { createInngestClient, createStorePingFunction } from "@repo/inngest";
import {
  createSlackClient,
  createStorePingSlackNotifier,
  createUpstashRedis,
} from "@repo/integrations";
import { createPrismaClient, PrismaStorePingRunRepository } from "@repo/prisma";
import { onRequest } from "firebase-functions/v2/https";
import { serve } from "inngest/express";

import { env } from "./env";
import { getFunctionsLogger } from "./logger";

const INNGEST_APP_ID = "portfolio-functions";

let handler: ReturnType<typeof serve> | undefined;

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

    const prisma = createPrismaClient({
      connectionString: env.DATABASE_URL,
    });
    const storePingRepo = new PrismaStorePingRunRepository(prisma);
    const storePingUseCase = new StorePingUseCase(storePingRepo, cacheStore);

    const slackClient = createSlackClient({
      token: env.SLACK_BOT_TOKEN,
    });
    const slackNotifier = createStorePingSlackNotifier({
      channelId: env.SLACK_CHANNEL_ID,
      client: slackClient,
    });

    const inngestClient = createInngestClient({
      id: INNGEST_APP_ID,
      eventKey: env.INNGEST_EVENT_KEY,
    });

    const storePing = createStorePingFunction(inngestClient, {
      notifier: slackNotifier,
      storePing: storePingUseCase,
    });

    handler = serve({
      client: inngestClient,
      functions: [storePing],
    });

    logger.info("Inngest handler initialized", { appId: INNGEST_APP_ID });
  }

  await handler(req, res);
});
