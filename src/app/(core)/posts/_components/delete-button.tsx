"use client";

import { Trash2 } from "lucide-react";
import * as React from "react";
import { useActionState } from "react";
import { deletePost } from "@/app/(core)/posts/_actions/delete-action";
import { Button } from "@/components/ui/button/button";

export type ActionState = {
  success: boolean;
};

const action = async (
  _: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const id = formData.get("id");
  if (typeof id !== "string") throw new Error("missing required params");
  return await deletePost(Number(id));
};

export default function DeleteButton({ id }: { id: number }) {
  const [_, formAction, isLoading] = useActionState(action, {
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
