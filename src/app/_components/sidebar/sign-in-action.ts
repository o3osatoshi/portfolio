"use server";

import { redirect } from "next/navigation";
import { signIn as authSignIn } from "@/lib/auth";

export const signIn = async (): Promise<void> => {
  await authSignIn("google");
  redirect("/");
};
