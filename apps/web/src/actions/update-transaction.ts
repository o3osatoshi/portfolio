"use server";

import {
  parseUpdateTransactionRequest,
  UpdateTransactionUseCase,
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
const usecase = new UpdateTransactionUseCase(repo);

export const updateTransaction = async (
  _: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> => {
  return getMe()
    .andThen((me) =>
      parseUpdateTransactionRequest({
        ...Object.fromEntries(formData),
      }).map((req) => ({ me, req })),
    )
    .andThen(({ me, req }) => usecase.execute(req, me.id).map(() => me))
    .match<ActionState>(
      (me) => {
        revalidateTag(getTag("labs-transactions", { userId: me.id }));
        redirect(getPath("labs-server-crud"));
      },
      (error) => err(error),
    );
};
