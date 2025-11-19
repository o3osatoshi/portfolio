"use server";

import {
  CreateTransactionUseCase,
  parseCreateTransactionRequest,
} from "@repo/application";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { env } from "@/env/server";
import { getMe } from "@/services/get-me";
import { type ActionState, err } from "@/utils/action-state";
import { getPath, getTag } from "@/utils/nav-handler";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const repo = new PrismaTransactionRepository(client);
const usecase = new CreateTransactionUseCase(repo);

export const createTransaction = async (
  _: ActionState | undefined,
  formData: FormData,
): Promise<ActionState> => {
  const res = await getMe();
  if (res.isErr()) {
    if (res.error.name.includes("Unauthorized")) {
      return err("You must be logged in to create a transaction.");
    }
    return err("An error occurred while retrieving user information.");
  }
  const userId = res.value.id;
  if (userId === undefined) {
    return err("You must be logged in to create a transaction.");
  }

  const result = parseCreateTransactionRequest({
    ...Object.fromEntries(formData),
    userId: res.value.id,
  });
  if (result.isErr()) {
    return err("validation error");
  }
  const executeResult = await usecase.execute(result.value);
  if (executeResult.isErr()) {
    return err(executeResult.error);
  }

  revalidateTag(getPath("labs-transactions"));
  revalidateTag(getTag("labs-transactions", { userId }));

  redirect(getPath("labs-server-crud"));
};
