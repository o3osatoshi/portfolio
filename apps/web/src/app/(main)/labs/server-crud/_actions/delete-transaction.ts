"use server";

import {
  DeleteTransactionUseCase,
  parseDeleteTransactionRequest,
} from "@repo/application";
import { PrismaTransactionRepository } from "@repo/prisma";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { deleteTransactionSchema } from "@/lib/validation";
import { type ActionState, err } from "@/utils/action-state";
import { getPathName, getTag } from "@/utils/handle-nav";

const repo = new PrismaTransactionRepository();
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

    const session = await auth();
    const userId = session?.user?.id;
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
