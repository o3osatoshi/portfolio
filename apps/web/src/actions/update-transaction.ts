"use server";

import {
  parseUpdateTransactionRequest,
  UpdateTransactionUseCase,
} from "@repo/application";
import { auth } from "@repo/auth";
import { PrismaTransactionRepository } from "@repo/prisma";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { type ActionState, err } from "@/utils/action-state";
import { getPath, getTag } from "@/utils/handle-nav";
import { updateTransactionSchema } from "@/utils/validation";

const repo = new PrismaTransactionRepository();
const usecase = new UpdateTransactionUseCase(repo);

export const updateTransaction = async (
  _: ActionState<never> | undefined,
  formData: FormData,
): Promise<ActionState<never>> => {
  try {
    const result = updateTransactionSchema.safeParse(
      Object.fromEntries(formData),
    );
    if (!result.success) {
      return err("validation error");
    }

    const session = await auth();
    const userId = session?.user?.id;
    if (userId === undefined) {
      return err("You must be logged in to update a transaction.");
    }

    const res = parseUpdateTransactionRequest(result.data);
    if (res.isErr()) {
      return err("validation error");
    }
    const executeResult = await usecase.execute(res.value, userId);
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
    return err("Failed to update the transaction. Please try again later.");
  }

  redirect(getPath("labs-server-crud"));
};
