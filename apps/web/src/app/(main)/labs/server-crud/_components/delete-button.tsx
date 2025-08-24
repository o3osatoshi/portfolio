"use client";

import { deleteTransaction } from "@/app/(main)/labs/server-crud/_actions/delete-transaction";
import type { ActionState } from "@/utils/action-state";
import { Button } from "@repo/ui/components/button";
import { Trash2 } from "lucide-react";
import * as React from "react";
import { useActionState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const [_, dispatch, isPending] = useActionState<
    ActionState<never> | undefined,
    FormData
  >(deleteTransaction, undefined);

  return (
    <form action={dispatch}>
      <input name="id" type="hidden" value={id} />
      <Button disabled={isPending} size="icon" type="submit" variant="ghost">
        <Trash2 />
      </Button>
    </form>
  );
}
