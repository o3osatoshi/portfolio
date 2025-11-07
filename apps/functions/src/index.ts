import {
  buildApp,
  createExpressRequestHandler,
} from "@repo/interface/http/node";
import { PrismaTransactionRepository } from "@repo/prisma";
import { onRequest } from "firebase-functions/v2/https";

const repo = new PrismaTransactionRepository();

const app = buildApp({ transactionRepo: repo });

export const api = onRequest(createExpressRequestHandler(app));
