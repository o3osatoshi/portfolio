"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export type ActionState = {
  success: boolean;
};

export const updatePost = async (
  id: number,
  title: string,
  content: string,
): Promise<ActionState> => {
  await prisma.post.update({
    where: { id },
    data: {
      title,
      content,
    },
  });
  redirect("/");
};
