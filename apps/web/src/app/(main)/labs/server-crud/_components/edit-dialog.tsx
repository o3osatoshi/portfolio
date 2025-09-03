"use client";

import { updateTransaction } from "@/app/(main)/labs/server-crud/_actions/update-transaction";
import type { ActionState } from "@/utils/action-state";
import { zodResolver } from "@hookform/resolvers/zod";
import Message from "@o3osatoshi/ui/components/base/message";
import { Button } from "@o3osatoshi/ui/components/button";
import { FormInput } from "@o3osatoshi/ui/components/case/form-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@o3osatoshi/ui/components/dialog";
import type { Transaction } from "@repo/validation";
import { updateTransactionSchema } from "@repo/validation";
import { Pencil } from "lucide-react";
import * as React from "react";
import { type FormEvent, useActionState } from "react";
import { useForm } from "react-hook-form";

interface Props {
  transaction: Transaction;
}

export default function EditDialog({ transaction }: Props) {
  const [state, dispatch, isPending] = useActionState<
    ActionState<never> | undefined,
    FormData
  >(updateTransaction, undefined);

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
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
              label="Type"
              defaultValue={transaction.type}
              id="type"
              {...register("type")}
              type="text"
              errorMessage={errors.type?.message}
            />
            <FormInput
              label="Datetime"
              defaultValue={transaction.datetime.toISOString().slice(0, 16)}
              id="datetime"
              {...register("datetime")}
              type="datetime-local"
              errorMessage={errors.datetime?.message}
            />
            <FormInput
              label="Amount"
              defaultValue={transaction.amount}
              id="amount"
              {...register("amount")}
              type="number"
              errorMessage={errors.amount?.message}
            />
            <FormInput
              label="Price"
              defaultValue={transaction.price}
              id="price"
              {...register("price")}
              type="number"
              errorMessage={errors.price?.message}
            />
            <FormInput
              label="Currency"
              defaultValue={transaction.currency}
              id="currency"
              {...register("currency")}
              type="text"
              errorMessage={errors.currency?.message}
            />
            <FormInput
              label="Profit Loss"
              defaultValue={transaction.profitLoss ?? ""}
              id="profitLoss"
              {...register("profitLoss")}
              type="text"
              errorMessage={errors.profitLoss?.message}
            />
            <FormInput
              label="Fee"
              defaultValue={transaction.fee ?? ""}
              id="fee"
              {...register("fee")}
              type="number"
              errorMessage={errors.fee?.message}
            />
            <FormInput
              label="Fee Currency"
              defaultValue={transaction.feeCurrency ?? ""}
              id="feeCurrency"
              {...register("feeCurrency")}
              type="text"
              errorMessage={errors.feeCurrency?.message}
            />
          </div>
          <DialogFooter>
            <div className="flex flex-col items-end gap-2">
              {state?.ok === false && (
                <Message variant="destructive">{state.error.message}</Message>
              )}
              <Button
                disabled={Object.keys(errors).length > 0 || isPending}
                type="submit"
                className="w-fit"
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
