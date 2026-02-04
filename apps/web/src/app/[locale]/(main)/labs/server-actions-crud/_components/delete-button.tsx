"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";

import { deleteTransaction } from "@/actions/delete-transaction";
import type { ActionState } from "@o3osatoshi/toolkit";
import { Button } from "@o3osatoshi/ui";

interface Props {
  id: string;
  locale: string;
}

export default function DeleteButton({ id, locale }: Props) {
  const [_, dispatch, isPending] = useActionState<
    ActionState | undefined,
    FormData
  >(deleteTransaction, undefined);

  return (
    <form action={dispatch}>
      <input name="id" type="hidden" value={id} />
      <input name="locale" type="hidden" value={locale} />
      <Button disabled={isPending} size="icon" type="submit" variant="ghost">
        <Trash2 />
      </Button>
    </form>
  );
}
