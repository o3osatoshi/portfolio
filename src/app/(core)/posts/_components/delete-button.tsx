"use client";

import { Trash2 } from "lucide-react";
import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { deletePost } from "@/app/(core)/posts/_actions/delete-post";
import { Button } from "@/components/ui/button/button";
import { ActionResult, err } from "@/utils/action-result";

const action = async (
  _: ActionResult<never> | undefined,
  formData: FormData,
): Promise<ActionResult<never>> => {
  const id = formData.get("id");
  if (typeof id !== "string") {
    return err("Required fields are missing.");
  }
  const result = await deletePost(Number(id));
  console.log("result", result);
  if (!result.ok) {
    toast.error(result.error.message);
  }
  return result;
};

export default function DeleteButton({ id }: { id: number }) {
  const [_, formAction, isLoading] = useActionState<
    ActionResult<never> | undefined,
    FormData
  >(action, undefined);

  return (
    <form action={formAction}>
      <input name="id" type="hidden" value={id} />
      <Button disabled={isLoading} size="icon" type="submit" variant="ghost">
        <Trash2 />
      </Button>
    </form>
  );
}
