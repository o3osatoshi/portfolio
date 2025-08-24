import { GetTransactionsUseCase } from "@repo/application";
import { TransactionRepository } from "@repo/prisma";
import type { NextRequest } from "next/server";

const repo = new TransactionRepository();
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
  const result = await usecase.execute(_userId);
  if (result.isErr()) {
    return new Response(result.error.message, { status: 500 });
  }
  const transactions = result.value;

  return Response.json(transactions);
}
