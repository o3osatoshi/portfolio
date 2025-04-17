"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionResult, err } from "@/utils/action-result";

export const createPost = async (
  title: string,
  content: string,
): Promise<ActionResult<never>> => {
  try {
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

    revalidatePath("/posts");
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("Failed to create the post. Please try again later.");
  }

  redirect("/posts");
};
