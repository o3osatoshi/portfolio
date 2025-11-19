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
  return getMe()
    .mapErr((error) =>
      error.name.includes("Unauthorized")
        ? "You must be logged in to create a transaction."
        : "An error occurred while retrieving user information.",
    )
    .andThen((me) => {
      return parseCreateTransactionRequest({
        ...Object.fromEntries(formData),
        userId: me.id,
      }).mapErr(() => "validation error");
    })
    .match(
      (req) =>
        usecase.execute(req).match<ActionState>(
          () => {
            revalidateTag(getPath("labs-transactions"));
            revalidateTag(getTag("labs-transactions", { userId: req.userId }));
            redirect(getPath("labs-server-crud"));
          },
          (error) => err(error),
        ),
      (message) => err(message),
    );
};
