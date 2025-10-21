import {
  GetTransactionsUseCase,
  parseGetTransactionsRequest,
} from "@repo/application";
import { PrismaTransactionRepository } from "@repo/prisma";
import type { NextRequest } from "next/server";

import { toHttpErrorResponse } from "@o3osatoshi/toolkit";

const repo = new PrismaTransactionRepository();
const usecase = new GetTransactionsUseCase(repo);

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId") ?? undefined;
  if (userId === undefined) return Response.json([]);

  return parseGetTransactionsRequest({ userId })
    .asyncAndThen((dto) => usecase.execute(dto))
    .map((transactions) => Response.json(transactions))
    .mapErr((err) => {
      const { body, status } = toHttpErrorResponse(err);
      return Response.json(body, { status });
    })
    .match(
      (okRes) => okRes,
      (errRes) => errRes,
    );
}
