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
import { getMe } from "@/services/get-me";
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

  return getMe()
    .andThen((me) =>
      parseUpdateTransactionRequest({
        ...Object.fromEntries(formData),
      }).map((req) => ({ me, req })),
    )
    .andThen(({ me, req }) => usecase.execute(req, me.id).map(() => me))
    .match<undefined, ActionState>(
      (me) => {
        updateTag(getTag("labs-transactions", { userId: me.id }));
        redirect({ href: getPath("labs-server-crud"), locale });
      },
      (error) => err(error),
    );
};
