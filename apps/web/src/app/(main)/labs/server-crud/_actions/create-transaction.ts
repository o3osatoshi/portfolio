"use server";

import { auth } from "@/lib/auth";
import { type ActionState, err } from "@/utils/action-state";
import { getPathName, getTag } from "@/utils/handle-nav";
import { CreateTransactionUseCase, parseCreateTransactionRequest } from "@repo/application";
import { PrismaTransactionRepository } from "@repo/prisma";
import { createTransactionSchema } from "@repo/validation";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

const repo = new PrismaTransactionRepository();
const usecase = new CreateTransactionUseCase(repo);

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

    const res = parseCreateTransactionRequest({
      ...result.data,
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
    return err("Failed to create the transaction. Please try again later.");
  }

  redirect(getPathName("labs-server-crud"));
};
