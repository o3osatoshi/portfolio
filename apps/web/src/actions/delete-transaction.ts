"use server";

import {
  DeleteTransactionUseCase,
  parseDeleteTransactionRequest,
} from "@repo/application";
import { getUserId } from "@repo/auth/react";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { env } from "@/env/server";
import { type ActionState, err } from "@/utils/action-state";
import { getPath, getTag } from "@/utils/nav-handler";
import { deleteTransactionSchema } from "@/utils/validation";

const client = createPrismaClient({ connectionString: env.DATABASE_URL });
const repo = new PrismaTransactionRepository(client);
const usecase = new DeleteTransactionUseCase(repo);

export const deleteTransaction = async (
  _: ActionState<never> | undefined,
  formData: FormData,
): Promise<ActionState<never>> => {
  try {
    const result = deleteTransactionSchema.safeParse(
      Object.fromEntries(formData),
    );
    if (!result.success) {
      return err("validation error");
    }
    const { id } = result.data;

    const userId = await getUserId();
    if (userId === undefined) {
      return err("You must be logged in to delete a transaction.");
    }

    const res = parseDeleteTransactionRequest({
      id,
      userId,
    });
    if (res.isErr()) {
      return err("validation error");
    }
    const executeResult = await usecase.execute(res.value);
    if (executeResult.isErr()) {
      return err(executeResult.error);
    }

    revalidateTag(getPath("labs-transactions"));
    revalidateTag(getTag("labs-transactions", { userId }));
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("Failed to delete the transaction. Please try again later.");
  }

  redirect(getPath("labs-server-crud"));
};
