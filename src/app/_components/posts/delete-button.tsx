"use client";

import { Trash2 } from "lucide-react";
import * as React from "react";
import { useActionState } from "react";
import { deletePost } from "@/app/_components/posts/delete-action";
import { Button } from "@/components/ui/button/button";

export type FormStateType = {
  success: boolean;
};

const deleteFormAction = async (
  _: FormStateType,
  formData: FormData,
): Promise<FormStateType> => {
  const id = Number(formData.get("id"));
  return await deletePost(id);
};

export default function DeleteButton({ id }: { id: number }) {
  const [_, formAction, isLoading] = useActionState(deleteFormAction, {
    success: false,
  });

  return (
    <form action={formAction}>
      <input name="id" type="hidden" value={id} />
      <Button disabled={isLoading} size="icon" type="submit" variant="ghost">
        <Trash2 />
      </Button>
    </form>
  );
}
