"use client";

import { deletePost } from "@/app/(signedin)/core/crud/_actions/delete-post";
import type { ActionResult } from "@/utils/action-result";
import { Button } from "@repo/ui/components/button";
import { Trash2 } from "lucide-react";
import * as React from "react";
import { useActionState } from "react";

export default function DeleteButton({ id }: { id: number }) {
  const [_, formAction, isLoading] = useActionState<
    ActionResult<never> | undefined,
    FormData
  >(deletePost, undefined);

  return (
    <form action={formAction}>
      <input name="id" type="hidden" value={id} />
      <Button disabled={isLoading} size="icon" type="submit" variant="ghost">
        <Trash2 />
      </Button>
    </form>
  );
}
