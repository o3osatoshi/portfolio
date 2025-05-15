"use client";

import { deletePost } from "@/app/(signedin)/core/crud/_actions/delete-post";
import { type ActionResult, err } from "@/utils/action-result";
import { Button } from "@repo/ui/components/button";
import { Trash2 } from "lucide-react";
import * as React from "react";
import { useActionState } from "react";

const action = async (
  _: ActionResult<never> | undefined,
  formData: FormData,
): Promise<ActionResult<never>> => {
  const id = formData.get("id");
  if (typeof id !== "string") {
    return err("Required fields are missing.");
  }
  const result = await deletePost(Number(id));
  if (!result.ok) {
    console.log(result.error.message);
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
