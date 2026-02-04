"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import { type FormEvent, useActionState } from "react";
import { useForm } from "react-hook-form";

import { updateTransaction } from "@/actions/update-transaction";
import type { Transaction } from "@/server/get-transactions";
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
  locale: string;
  transaction: Transaction;
}

export default function EditDialog({ locale, transaction }: Props) {
  const t = useTranslations("LabsServerCrud");
  const [state, dispatch, isPending] = useActionState<
    ActionState | undefined,
    FormData
  >(updateTransaction, undefined);
  const labels = {
    amount: t("sections.transactions.fields.amount"),
    currency: t("sections.transactions.fields.currency"),
    datetime: t("sections.transactions.fields.datetime"),
    fee: t("sections.transactions.fields.fee"),
    feeCurrency: t("sections.transactions.fields.feeCurrency"),
    price: t("sections.transactions.fields.price"),
    profitLoss: t("sections.transactions.fields.profitLoss"),
    type: t("sections.transactions.fields.type"),
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
          <input name="locale" type="hidden" value={locale} />
          <DialogHeader>
            <DialogTitle>
              {t("sections.transactions.editDialog.title")}
            </DialogTitle>
            <DialogDescription>
              {t("sections.transactions.editDialog.description")}
            </DialogDescription>
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
                {t("sections.transactions.editDialog.save")}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
