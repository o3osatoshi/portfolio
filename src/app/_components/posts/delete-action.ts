"use server";

import { redirect } from "next/navigation";
import { FormStateType } from "@/app/_components/posts/delete-button";
import prisma from "@/lib/prisma";

export const deletePost = async (id: number): Promise<FormStateType> => {
  await prisma.post.delete({
    where: { id },
  });
  redirect("/");
};
