"use server";

import { redirect } from "next/navigation";
import { ActionState } from "@/app/(core)/posts/_components/delete-button";
import prisma from "@/lib/prisma";

export const deletePost = async (id: number): Promise<ActionState> => {
  await prisma.post.delete({
    where: { id },
  });
  redirect("/");
};
