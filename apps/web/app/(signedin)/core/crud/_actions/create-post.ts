"use server";

import { auth } from "@/lib/auth";
import { type ActionState, err } from "@/utils/action-state";
import { getPathName, getTag } from "@/utils/handle-nav";
import { prisma } from "@repo/database";
import { zCreatePost } from "@repo/database/schemas";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export const createPost = async (
  _: ActionState<never> | undefined,
  formData: FormData,
): Promise<ActionState<never>> => {
  try {
    const result = zCreatePost.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      return err("validation error");
    }
    const { title, content } = result.data;

    const session = await auth();
    const userId = session?.user?.id;
    if (userId === undefined) {
      return err("You must be logged in to create a post.");
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: true,
        authorId: userId,
      },
    });
    if (post === undefined || post === null) {
      return err("Failed to create the post. Please try again later.");
    }

    revalidateTag(getPathName("core-posts"));
    revalidateTag(getTag("core-posts", { authorId: userId }));
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("Failed to create the post. Please try again later.");
  }

  redirect(getPathName("core-crud"));
};
