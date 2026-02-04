"use server";

import {
  CreateTransactionUseCase,
  parseCreateTransactionRequest,
} from "@repo/application";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
import { hasLocale } from "next-intl";
import { updateTag } from "next/cache";

import { env } from "@/env/server";
import { redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
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
  const formLocale = formData.get("locale");
  const locale =
    typeof formLocale === "string" && hasLocale(routing.locales, formLocale)
      ? formLocale
      : routing.defaultLocale;

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
