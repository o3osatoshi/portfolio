"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";

import { deleteTransaction } from "@/actions/delete-transaction";
import type { ActionState } from "@/utils/action-state";
import { Button } from "@o3osatoshi/ui";

interface Props {
  id: string;
}

export default function DeleteButton({ id }: Props) {
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
