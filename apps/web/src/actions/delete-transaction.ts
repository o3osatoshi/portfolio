"use server";

import {
  DeleteTransactionUseCase,
  parseDeleteTransactionRequest,
} from "@repo/application";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { env } from "@/env/server";
import { getMe } from "@/services/get-me";
import { getPath, getTag } from "@/utils/nav-handler";
import { type ActionState, err } from "@o3osatoshi/toolkit";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const repo = new PrismaTransactionRepository(client);
const usecase = new DeleteTransactionUseCase(repo);

export const deleteTransaction = async (
  _: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> => {
  return getMe()
    .andThen((me) =>
      parseDeleteTransactionRequest({
        ...Object.fromEntries(formData),
        userId: me.id,
      }),
    )
    .andThen((req) => usecase.execute(req).map(() => req))
    .match<ActionState>(
      (req) => {
        revalidateTag(getTag("labs-transactions", { userId: req.userId }));
        redirect(getPath("labs-server-crud"));
      },
      (error) => err(error),
    );
};
