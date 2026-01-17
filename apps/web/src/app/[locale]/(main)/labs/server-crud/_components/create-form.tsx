"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { type FormEvent, useActionState } from "react";
import { useForm } from "react-hook-form";

import { createTransaction } from "@/actions/create-transaction";
import { createTransactionSchema } from "@/utils/validation";
import type { ActionState } from "@o3osatoshi/toolkit";
import { Button, FormInput, Message } from "@o3osatoshi/ui";

export default function CreateForm() {
  const t = useTranslations("Transactions");
  const [state, dispatch, isPending] = useActionState<
    ActionState | undefined,
    FormData
  >(createTransaction, undefined);
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
  } = useForm({ resolver: zodResolver(createTransactionSchema) });

  const validate = async (e: FormEvent<HTMLFormElement>) => {
    const result = createTransactionSchema.safeParse(getValues());
    if (!result.success) {
      e.preventDefault();
    }
    await handleSubmit(() => {})();
  };

  return (
    <form action={dispatch} onSubmit={validate}>
      <div className="flex flex-col gap-2">
        <FormInput
          id="type"
          label={labels.type}
          {...register("type")}
          errorMessage={errors.type?.message}
          placeholder={labels.type}
          type="text"
        />
        <FormInput
          id="datetime"
          label={labels.datetime}
          {...register("datetime")}
          errorMessage={errors.datetime?.message}
          placeholder={labels.datetime}
          type="datetime-local"
        />
        <FormInput
          id="amount"
          label={labels.amount}
          {...register("amount")}
          errorMessage={errors.amount?.message}
          placeholder={labels.amount}
          type="number"
        />
        <FormInput
          id="price"
          label={labels.price}
          {...register("price")}
          errorMessage={errors.price?.message}
          placeholder={labels.price}
          type="number"
        />
        <FormInput
          id="currency"
          label={labels.currency}
          {...register("currency")}
          errorMessage={errors.currency?.message}
          placeholder={labels.currency}
          type="text"
        />
        <FormInput
          id="profitLoss"
          label={labels.profitLoss}
          {...register("profitLoss")}
          errorMessage={errors.profitLoss?.message}
          placeholder={labels.profitLoss}
          type="number"
        />
        <FormInput
          id="fee"
          label={labels.fee}
          {...register("fee")}
          errorMessage={errors.fee?.message}
          placeholder={labels.fee}
          type="number"
        />
        <FormInput
          id="feeCurrency"
          label={labels.feeCurrency}
          {...register("feeCurrency")}
          errorMessage={errors.feeCurrency?.message}
          placeholder={labels.feeCurrency}
          type="text"
        />
        {state?.ok === false && (
          <Message variant="destructive">{state.error.message}</Message>
        )}
        <Button
          disabled={Object.keys(errors).length > 0 || isPending}
          type="submit"
        >
          {t("create")}
        </Button>
      </div>
    </form>
  );
}
