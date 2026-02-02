"use server";

import {
  parseUpdateTransactionRequest,
  UpdateTransactionUseCase,
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
const usecase = new UpdateTransactionUseCase(repo);

export const updateTransaction = async (
  _: ActionState | undefined,
  formData: FormData,
): Promise<ActionState | undefined> => {
  const locale = await getLocale();

  return getUserId()
    .andThen((userId) =>
      parseUpdateTransactionRequest({
        ...Object.fromEntries(formData),
      }).map((req) => ({ req, userId })),
    )
    .andThen(({ req, userId }) =>
      usecase.execute(req, userId).map(() => userId),
    )
    .match<undefined, ActionState>(
      (userId) => {
        updateTag(getTag("labs-transactions", { userId }));
        redirect({ href: getPath("labs-server-actions-crud"), locale });
      },
      (error) => err(error),
    );
};
