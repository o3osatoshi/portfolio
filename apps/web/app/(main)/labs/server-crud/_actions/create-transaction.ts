"use server";

import { zCreateTransaction } from "@/app/(main)/labs/server-crud/_lib/schemas";
import { auth } from "@/lib/auth";
import { type ActionState, err } from "@/utils/action-state";
import { getPathName, getTag } from "@/utils/handle-nav";
import { type CreateTransaction, TransactionUseCase } from "@repo/domain";
import { PrismaTransactionRepository } from "@repo/prisma";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

const repo = new PrismaTransactionRepository();
const usecase = new TransactionUseCase(repo);

export const createTransaction = async (
  _: ActionState<never> | undefined,
  formData: FormData,
): Promise<ActionState<never>> => {
  try {
    const result = zCreateTransaction.safeParse(Object.fromEntries(formData));
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
    await usecase.create(tx);

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
