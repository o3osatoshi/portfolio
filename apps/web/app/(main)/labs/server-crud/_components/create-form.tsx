"use client";

import { createTransaction } from "@/app/(main)/labs/server-crud/_actions/create-transaction";
import { zCreateTransaction } from "@/app/(main)/labs/server-crud/_lib/schemas";
import type { ActionState } from "@/utils/action-state";
import { zodResolver } from "@hookform/resolvers/zod";
import Message from "@repo/ui/components/base/message";
import { Button } from "@repo/ui/components/button";
import { FormInput } from "@repo/ui/components/case/form-input";
import { type FormEvent, useActionState } from "react";
import { useForm } from "react-hook-form";

export default function CreateForm() {
  const [state, dispatch, isPending] = useActionState<
    ActionState<never> | undefined,
    FormData
  >(createTransaction, undefined);

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm({ resolver: zodResolver(zCreateTransaction) });

  const validate = async (e: FormEvent<HTMLFormElement>) => {
    const result = zCreateTransaction.safeParse(getValues());
    if (!result.success) {
      e.preventDefault();
    }
    await handleSubmit(() => {})();
  };

  return (
    <form action={dispatch} onSubmit={validate}>
      <div className="flex flex-col gap-2">
        <FormInput
          label="Type"
          id="type"
          {...register("type")}
          placeholder="Type"
          type="text"
          errorMessage={errors.type?.message}
        />
        <FormInput
          label="Datetime"
          id="datetime"
          {...register("datetime")}
          placeholder="Datetime"
          type="datetime-local"
          errorMessage={errors.datetime?.message}
        />
        <FormInput
          label="Amount"
          id="amount"
          {...register("amount")}
          placeholder="Amount"
          type="number"
          errorMessage={errors.amount?.message}
        />
        <FormInput
          label="Price"
          id="price"
          {...register("price")}
          placeholder="Price"
          type="number"
          errorMessage={errors.price?.message}
        />
        <FormInput
          label="Currency"
          id="currency"
          {...register("currency")}
          placeholder="Currency"
          type="text"
          errorMessage={errors.currency?.message}
        />
        <FormInput
          label="Profit Loss"
          id="profitLoss"
          {...register("profitLoss")}
          placeholder="Profit Loss"
          type="number"
          errorMessage={errors.profitLoss?.message}
        />
        <FormInput
          label="Fee"
          id="fee"
          {...register("fee")}
          placeholder="Fee"
          type="number"
          errorMessage={errors.fee?.message}
        />
        <FormInput
          label="Fee Currency"
          id="feeCurrency"
          {...register("feeCurrency")}
          placeholder="Fee Currency"
          type="text"
          errorMessage={errors.feeCurrency?.message}
        />
        {state?.ok === false && (
          <Message variant="destructive">{state.error.message}</Message>
        )}
        <Button
          disabled={Object.keys(errors).length > 0 || isPending}
          type="submit"
        >
          Create Transaction
        </Button>
      </div>
    </form>
  );
}
