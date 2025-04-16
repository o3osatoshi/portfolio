"use server";

import { redirect } from "next/navigation";
import { ActionState } from "@/app/(core)/posts/_components/delete-button";
import prisma from "@/lib/prisma";

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
