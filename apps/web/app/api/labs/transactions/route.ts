import { GetTransactionsUseCase } from "@repo/application";
import { PrismaTransactionRepository } from "@repo/prisma";
import type { NextRequest } from "next/server";

const repo = new PrismaTransactionRepository();
const usecase = new GetTransactionsUseCase(repo);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const _userId = userId === null ? undefined : userId;

  console.log(
    `[GET /labs/transactions] called with userId=${userId ?? "none"}`,
  );

  if (_userId === undefined) {
    return Response.json([]);
  }
  const transactions = await usecase.execute(_userId);

  return Response.json(transactions);
}
