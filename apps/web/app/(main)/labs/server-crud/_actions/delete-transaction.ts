"use server";

import { auth } from "@/lib/auth";
import { type ActionState, err } from "@/utils/action-state";
import { getPathName, getTag } from "@/utils/handle-nav";
import { TransactionUseCase } from "@repo/domain";
import { PrismaTransactionRepository } from "@repo/prisma";
import { deleteTransactionSchema } from "@repo/validation";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

const repo = new PrismaTransactionRepository();
const usecase = new TransactionUseCase(repo);

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

    const session = await auth();
    const userId = session?.user?.id;
    if (userId === undefined) {
      return err("You must be logged in to delete a transaction.");
    }

    await usecase.delete(id, userId);

    revalidateTag(getPathName("labs-transactions"));
    revalidateTag(getTag("labs-transactions", { userId }));
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("Failed to delete the transaction. Please try again later.");
  }

  redirect(getPathName("labs-server-crud"));
};
