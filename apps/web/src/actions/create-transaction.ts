"use server";

import {
  CreateTransactionUseCase,
  parseCreateTransactionRequest,
} from "@repo/application";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
import { getLocale } from "next-intl/server";
import { updateTag } from "next/cache";

import { env } from "@/env/server";
import { redirect } from "@/i18n/navigation";
import { getUserId } from "@/server/auth";
import { getPath, getTag } from "@/utils/nav-handler";
import { type ActionState, err } from "@o3osatoshi/toolkit";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const repo = new PrismaTransactionRepository(client);
const usecase = new CreateTransactionUseCase(repo);

export const createTransaction = async (
  _: ActionState | undefined,
  formData: FormData,
): Promise<ActionState | undefined> => {
  const locale = await getLocale();

  return getUserId()
    .andThen((userId) =>
      parseCreateTransactionRequest({
        ...Object.fromEntries(formData),
        userId,
      }),
    )
    .andThen((req) => usecase.execute(req))
    .match<undefined, ActionState>(
      (res) => {
        updateTag(getTag("labs-transactions", { userId: res.userId }));
        redirect({ href: getPath("labs-server-actions-crud"), locale });
      },
      (error) => err(error),
    );
};
