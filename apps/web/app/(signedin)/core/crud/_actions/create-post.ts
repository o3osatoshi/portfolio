"use server";

import { auth } from "@/lib/auth";
import { type ActionResult, err } from "@/utils/action-result";
import { getPathName, getTag } from "@/utils/handle-nav";
import { prisma } from "@repo/database";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export const createPost = async (
  title: string,
  content: string,
): Promise<ActionResult<never>> => {
  try {
    console.log("createPost", title, content);
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
