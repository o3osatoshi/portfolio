import { GetTransactionsUseCase, parseGetTransactionsReqDto } from "@repo/application";
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

  const res = parseGetTransactionsReqDto({ userId: _userId });
  if (res.isErr()) {
    return new Response("Invalid request", { status: 400 });
  }
  const result = await usecase.execute(res.value);
  if (result.isErr()) {
    return new Response(result.error.message, { status: 500 });
  }
  const transactions = result.value;

  return Response.json(transactions);
}
