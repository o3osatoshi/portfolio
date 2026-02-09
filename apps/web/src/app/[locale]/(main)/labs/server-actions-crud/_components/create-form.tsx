"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { type FormEvent, useActionState } from "react";
import { useForm } from "react-hook-form";

import { createTransaction } from "@/actions/create-transaction";
import { useErrorMessage } from "@/utils/use-error-message";
import { createTransactionSchema } from "@/utils/validation";
import type { ActionState } from "@o3osatoshi/toolkit";
import { Button, FormInput, Message } from "@o3osatoshi/ui";

interface Props {
  locale: string;
}

export default function CreateForm({ locale }: Props) {
  const t = useTranslations("LabsServerCrud");
  const resolveErrorMessage = useErrorMessage();
  const [state, dispatch, isPending] = useActionState<
    ActionState | undefined,
    FormData
  >(createTransaction, undefined);
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
  } = useForm({ resolver: zodResolver(createTransactionSchema) });

  const validate = async (e: FormEvent<HTMLFormElement>) => {
    const result = createTransactionSchema.safeParse(getValues());
    if (!result.success) {
      e.preventDefault();
    }
    await handleSubmit(() => {})();
  };

  const actionErrorMessage =
    state?.ok === false ? resolveErrorMessage(state.error) : undefined;

  return (
    <form action={dispatch} onSubmit={validate}>
      <input name="locale" type="hidden" value={locale} />
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
        {actionErrorMessage ? (
          <Message variant="destructive">{actionErrorMessage}</Message>
        ) : null}
        <Button
          disabled={Object.keys(errors).length > 0 || isPending}
          type="submit"
        >
          {t("sections.transactions.actions.create")}
        </Button>
      </div>
    </form>
  );
}
