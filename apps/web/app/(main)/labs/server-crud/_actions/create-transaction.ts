"use server";

import { auth } from "@/lib/auth";
import { type ActionState, err } from "@/utils/action-state";
import { getPathName, getTag } from "@/utils/handle-nav";
import { RegisterTransactionUseCase } from "@repo/application";
import type { CreateTransaction } from "@repo/domain";
import { TransactionRepository } from "@repo/prisma";
import { createTransactionSchema } from "@repo/validation";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

const repo = new TransactionRepository();
const usecase = new RegisterTransactionUseCase(repo);

export const createTransaction = async (
  _: ActionState<never> | undefined,
  formData: FormData,
): Promise<ActionState<never>> => {
  try {
    const result = createTransactionSchema.safeParse(
      Object.fromEntries(formData),
    );
    if (!result.success) {
      return err("validation error");
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (userId === undefined) {
      return err("You must be logged in to create a transaction.");
    }

    const tx: CreateTransaction = {
      ...result.data,
      userId,
    };
    const executeResult = await usecase.execute(tx);
    if (executeResult.isErr()) {
      return err(executeResult.error);
    }

    revalidateTag(getPathName("labs-transactions"));
    revalidateTag(getTag("labs-transactions", { userId }));
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("Failed to create the transaction. Please try again later.");
  }

  redirect(getPathName("labs-server-crud"));
};
