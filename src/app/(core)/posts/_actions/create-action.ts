"use server";

import { redirect } from "next/navigation";
import { ActionState } from "@/app/(core)/posts/_components/delete-button";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const createPost = async (
  title: string,
  content: string,
): Promise<ActionState> => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error("User not authenticated");

  await prisma.post.create({
    data: {
      title,
      content,
      published: true,
      authorId: userId,
    },
  });
  redirect("/");
};
