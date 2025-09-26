/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {
  GetTransactionsUseCase,
  parseGetTransactionsRequest,
} from "@repo/application";
import { PrismaTransactionRepository } from "@repo/prisma";
import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const repo = new PrismaTransactionRepository();
const usecase = new GetTransactionsUseCase(repo);

export const helloWorld = onRequest(
  { invoker: "public" },
  (_request, response) => {
    logger.info("Hello logs! by turbo!", { structuredData: true });

    response.send("Hello from Firebase! by turbo! with clean architecture!");
  },
);

export const getTransactions = onRequest(
  { invoker: "public" },
  async (request, response) => {
    const userId = request.query["userId"];
    const _userId =
      typeof userId === "string"
        ? userId
        : Array.isArray(userId)
          ? userId[0]
          : undefined;
    logger.info(
      `[GET /getTransactions] called with userId=${_userId ?? "none"}`,
      { structuredData: true },
    );
    if (_userId === undefined) {
      response.status(400).send("Missing userId");
      return;
    }

    const res = parseGetTransactionsRequest({ userId: _userId });
    if (res.isErr()) {
      response.status(400).send("Invalid request");
      return;
    }

    const result = await usecase.execute(res.value);
    if (result.isErr()) {
      response.status(500).send(result.error.message);
      return;
    }
    const transactions = result.value;

    response.json(transactions);
  },
);
