"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useActionState } from "react";
import { useForm } from "react-hook-form";

import { updateTransaction } from "@/actions/update-transaction";
import type { Transaction } from "@/services/get-transactions";
import { updateTransactionSchema } from "@/utils/validation";
import type { ActionState } from "@o3osatoshi/toolkit";
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
  const t = useTranslations("Transactions");
  const [state, dispatch, isPending] = useActionState<
    ActionState | undefined,
    FormData
  >(updateTransaction, undefined);
  const labels = {
    amount: t("fields.amount"),
    currency: t("fields.currency"),
    datetime: t("fields.datetime"),
    fee: t("fields.fee"),
    feeCurrency: t("fields.feeCurrency"),
    price: t("fields.price"),
    profitLoss: t("fields.profitLoss"),
    type: t("fields.type"),
  };

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
            <DialogTitle>{t("edit.title")}</DialogTitle>
            <DialogDescription>{t("edit.description")}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <FormInput
              id="type"
              defaultValue={transaction.type}
              label={labels.type}
              {...register("type")}
              errorMessage={errors.type?.message}
              type="text"
            />
            <FormInput
              id="datetime"
              defaultValue={new Date(transaction.datetime)
                .toISOString()
                .slice(0, 16)}
              label={labels.datetime}
              {...register("datetime")}
              errorMessage={errors.datetime?.message}
              type="datetime-local"
            />
            <FormInput
              id="amount"
              defaultValue={transaction.amount}
              label={labels.amount}
              {...register("amount")}
              errorMessage={errors.amount?.message}
              type="number"
            />
            <FormInput
              id="price"
              defaultValue={transaction.price}
              label={labels.price}
              {...register("price")}
              errorMessage={errors.price?.message}
              type="number"
            />
            <FormInput
              id="currency"
              defaultValue={transaction.currency}
              label={labels.currency}
              {...register("currency")}
              errorMessage={errors.currency?.message}
              type="text"
            />
            <FormInput
              id="profitLoss"
              defaultValue={transaction.profitLoss ?? ""}
              label={labels.profitLoss}
              {...register("profitLoss")}
              errorMessage={errors.profitLoss?.message}
              type="text"
            />
            <FormInput
              id="fee"
              defaultValue={transaction.fee ?? ""}
              label={labels.fee}
              {...register("fee")}
              errorMessage={errors.fee?.message}
              type="number"
            />
            <FormInput
              id="feeCurrency"
              defaultValue={transaction.feeCurrency ?? ""}
              label={labels.feeCurrency}
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
                {t("edit.save")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
