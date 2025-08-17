"use server";

import { zUpdateTransaction } from "@/app/(main)/labs/server-crud/_lib/schemas";
import { auth } from "@/lib/auth";
import { type ActionState, err } from "@/utils/action-state";
import { getPathName, getTag } from "@/utils/handle-nav";
import { TransactionUseCase, type UpdateTransaction } from "@repo/domain";
import { PrismaTransactionRepository } from "@repo/prisma";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

const repo = new PrismaTransactionRepository();
const usecase = new TransactionUseCase(repo);

export const updateTransaction = async (
  _: ActionState<never> | undefined,
  formData: FormData,
): Promise<ActionState<never>> => {
  try {
    const result = zUpdateTransaction.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return err("validation error");
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (userId === undefined) {
      return err("You must be logged in to update a transaction.");
    }

    const tx: UpdateTransaction = {
      ...result.data,
    };
    await usecase.update(tx, userId);

    revalidateTag(getPathName("labs-transactions"));
    revalidateTag(getTag("labs-transactions", { userId }));
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("Failed to update the transaction. Please try again later.");
  }

  redirect(getPathName("labs-server-crud"));
};
