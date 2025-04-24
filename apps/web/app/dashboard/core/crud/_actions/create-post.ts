"use server";

import { type ActionResult, err } from "@/utils/action-result";
import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
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

    revalidatePath("/dashboard/core/crud");
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("Failed to create the post. Please try again later.");
  }

  redirect("/dashboard/core/crud");
};
