"use client";

import { Button } from "@o3osatoshi/ui";
import { Trash2 } from "lucide-react";
import { useActionState } from "react";
import { deleteTransaction } from "@/app/(main)/labs/server-crud/_actions/delete-transaction";
import type { ActionState } from "@/utils/action-state";

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
