"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type FormEvent, useActionState } from "react";
import { useForm } from "react-hook-form";

import { createTransaction } from "@/actions/create-transaction";
import type { ActionState } from "@/utils/action-state";
import { createTransactionSchema } from "@/utils/validation";
import { Button, FormInput, Message } from "@o3osatoshi/ui";

export default function CreateForm() {
  const [state, dispatch, isPending] = useActionState<
    ActionState<never> | undefined,
    FormData
  >(createTransaction, undefined);

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
          label="Type"
          {...register("type")}
          errorMessage={errors.type?.message}
          placeholder="Type"
          type="text"
        />
        <FormInput
          id="datetime"
          label="Datetime"
          {...register("datetime")}
          errorMessage={errors.datetime?.message}
          placeholder="Datetime"
          type="datetime-local"
        />
        <FormInput
          id="amount"
          label="Amount"
          {...register("amount")}
          errorMessage={errors.amount?.message}
          placeholder="Amount"
          type="number"
        />
        <FormInput
          id="price"
          label="Price"
          {...register("price")}
          errorMessage={errors.price?.message}
          placeholder="Price"
          type="number"
        />
        <FormInput
          id="currency"
          label="Currency"
          {...register("currency")}
          errorMessage={errors.currency?.message}
          placeholder="Currency"
          type="text"
        />
        <FormInput
          id="profitLoss"
          label="Profit Loss"
          {...register("profitLoss")}
          errorMessage={errors.profitLoss?.message}
          placeholder="Profit Loss"
          type="number"
        />
        <FormInput
          id="fee"
          label="Fee"
          {...register("fee")}
          errorMessage={errors.fee?.message}
          placeholder="Fee"
          type="number"
        />
        <FormInput
          id="feeCurrency"
          label="Fee Currency"
          {...register("feeCurrency")}
          errorMessage={errors.feeCurrency?.message}
          placeholder="Fee Currency"
          type="text"
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
