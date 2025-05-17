"use server";

import { auth } from "@/lib/auth";
import { type ActionState, err } from "@/utils/action-state";
import { getPathName, getTag } from "@/utils/handle-nav";
import { prisma } from "@repo/database";
import { zDeletePost } from "@repo/database/schemas";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export const deletePost = async (
  _: ActionState<never> | undefined,
  formData: FormData,
): Promise<ActionState<never>> => {
  try {
    const result = zDeletePost.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return err("validation error");
    }
    const { id } = result.data;

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

    revalidateTag(getPathName("core-posts"));
    revalidateTag(getTag("core-posts", { authorId: userId }));
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("Failed to delete the post. Please try again later.");
  }

  redirect(getPathName("core-crud"));
};
