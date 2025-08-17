import { TransactionUseCase } from "@repo/domain";
import { PrismaTransactionRepository } from "@repo/prisma";
import type { NextRequest } from "next/server";

const repo = new PrismaTransactionRepository();
const usecase = new TransactionUseCase(repo);

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");
  const _userId = userId === null ? undefined : userId;

  console.log(
    `[GET /labs/transactions] called with userId=${userId ?? "none"}`,
  );

  const transactions = usecase.find(_userId);

  return Response.json(transactions);
}
