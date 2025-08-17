"use server";

import { auth } from "@/lib/auth";
import { type ActionState, err } from "@/utils/action-state";
import { getPathName, getTag } from "@/utils/handle-nav";
import { prisma } from "@repo/prisma";
import { zUpdatePost } from "@repo/prisma/schemas";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export const updatePost = async (
  _: ActionState<never> | undefined,
  formData: FormData,
): Promise<ActionState<never>> => {
  try {
    const result = zUpdatePost.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return err("validation error");
    }
    const { id, title, content } = result.data;

    const session = await auth();
    const userId = session?.user?.id;
    if (userId === undefined) {
      return err("You must be logged in to update a post.");
    }

    const post = await prisma.post.findUnique({ where: { id } });
    if (post === null) {
      return err("The post you are trying to update does not exist.");
    }

    if (post.authorId !== userId) {
      return err("You are not authorized to update this post.");
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
      },
    });
    if (updatedPost === undefined || updatedPost === null) {
      return err("Failed to update the post. Please try again later.");
    }

    revalidateTag(getPathName("labs-posts"));
    revalidateTag(getTag("labs-posts", { authorId: userId }));
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("Failed to update the post. Please try again later.");
  }

  redirect(getPathName("labs-server-crud"));
};
