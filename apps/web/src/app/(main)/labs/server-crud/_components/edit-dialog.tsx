"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { type FormEvent, useActionState } from "react";
import { useForm } from "react-hook-form";

import { updateTransaction } from "@/app/(main)/labs/server-crud/_actions/update-transaction";
import type { Transaction } from "@/lib/validation";
import { updateTransactionSchema } from "@/lib/validation";
import type { ActionState } from "@/utils/action-state";
import { Button, FormInput, Message } from "@o3osatoshi/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@o3osatoshi/ui/client";

interface Props {
  transaction: Transaction;
}

export default function EditDialog({ transaction }: Props) {
  const [state, dispatch, isPending] = useActionState<
    ActionState<never> | undefined,
    FormData
  >(updateTransaction, undefined);

  const {
    formState: { errors },
    getValues,
    handleSubmit,
    register,
  } = useForm({ resolver: zodResolver(updateTransactionSchema) });

  const validate = async (e: FormEvent<HTMLFormElement>) => {
    const result = updateTransactionSchema.safeParse(getValues());
    if (!result.success) {
      e.preventDefault();
    }
    await handleSubmit(() => {})();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={dispatch} onSubmit={validate}>
          <input value={transaction.id} {...register("id")} type="hidden" />
          <DialogHeader>
            <DialogTitle>Edit transaction</DialogTitle>
            <DialogDescription>
              Make changes to your transaction here.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <FormInput
              id="type"
              defaultValue={transaction.type}
              label="Type"
              {...register("type")}
              errorMessage={errors.type?.message}
              type="text"
            />
            <FormInput
              id="datetime"
              defaultValue={transaction.datetime.toISOString().slice(0, 16)}
              label="Datetime"
              {...register("datetime")}
              errorMessage={errors.datetime?.message}
              type="datetime-local"
            />
            <FormInput
              id="amount"
              defaultValue={transaction.amount}
              label="Amount"
              {...register("amount")}
              errorMessage={errors.amount?.message}
              type="number"
            />
            <FormInput
              id="price"
              defaultValue={transaction.price}
              label="Price"
              {...register("price")}
              errorMessage={errors.price?.message}
              type="number"
            />
            <FormInput
              id="currency"
              defaultValue={transaction.currency}
              label="Currency"
              {...register("currency")}
              errorMessage={errors.currency?.message}
              type="text"
            />
            <FormInput
              id="profitLoss"
              defaultValue={transaction.profitLoss ?? ""}
              label="Profit Loss"
              {...register("profitLoss")}
              errorMessage={errors.profitLoss?.message}
              type="text"
            />
            <FormInput
              id="fee"
              defaultValue={transaction.fee ?? ""}
              label="Fee"
              {...register("fee")}
              errorMessage={errors.fee?.message}
              type="number"
            />
            <FormInput
              id="feeCurrency"
              defaultValue={transaction.feeCurrency ?? ""}
              label="Fee Currency"
              {...register("feeCurrency")}
              errorMessage={errors.feeCurrency?.message}
              type="text"
            />
          </div>
          <DialogFooter>
            <div className="flex flex-col items-end gap-2">
              {state?.ok === false && (
                <Message variant="destructive">{state.error.message}</Message>
              )}
              <Button
                className="w-fit"
                disabled={Object.keys(errors).length > 0 || isPending}
                type="submit"
              >
                Save changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
