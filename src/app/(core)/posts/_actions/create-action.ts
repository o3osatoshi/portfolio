"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionResult, err } from "@/utils/action-result";

export const createPost = async (
  title: string,
  content: string,
): Promise<ActionResult<null>> => {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return err("unauthorized");
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
      return err("failed to create post");
    }

    redirect("/");
  } catch (error: unknown) {
    console.error(error);
    if (error instanceof Error) {
      return err(error);
    }
    return err("unknown error");
  }
};
