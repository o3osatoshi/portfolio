"use server";

import { auth } from "@/lib/auth";
import { type ActionResult, err } from "@/utils/action-result";
import { getPathName, getTag } from "@/utils/handle-nav";
import { prisma } from "@repo/database";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export const updatePost = async (
  _: ActionResult<never> | undefined,
  formData: FormData,
): Promise<ActionResult<never>> => {
  try {
    const _id = formData.get("id");
    const title = formData.get("title");
    const content = formData.get("content");
    if (
      typeof _id !== "string" ||
      typeof title !== "string" ||
      typeof content !== "string"
    ) {
      return err("Required fields are missing.");
    }
    const id = Number(_id);

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

    revalidateTag(getPathName("core-posts"));
    revalidateTag(getTag("core-posts", { authorId: userId }));
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("Failed to update the post. Please try again later.");
  }

  redirect(getPathName("core-crud"));
};
