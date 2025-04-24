"use server";

import { type ActionResult, err } from "@/utils/action-result";
import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const deletePost = async (id: number): Promise<ActionResult<never>> => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (userId === undefined) {
      return err("You must be logged in to delete a post.");
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (post === null) {
      return err("The post you are trying to delete does not exist.");
    }

    if (post.authorId !== userId) {
      return err("You are not authorized to delete this post.");
    }

    const deletedPost = await prisma.post.delete({ where: { id } });
    if (deletedPost === undefined || deletedPost === null) {
      return err("Failed to delete the post. Please try again later.");
    }

    revalidatePath("/dashboard/core/crud");
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("Failed to delete the post. Please try again later.");
  }

  redirect("/dashboard/core/crud");
};
