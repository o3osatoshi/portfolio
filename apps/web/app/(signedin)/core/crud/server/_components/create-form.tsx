"use client";

import { createPost } from "@/app/(signedin)/core/crud/server/_actions/create-post";
import type { ActionState } from "@/utils/action-state";
import { zodResolver } from "@hookform/resolvers/zod";
import { zCreatePost } from "@repo/database/schemas";
import Message from "@repo/ui/components/base/message";
import { Button } from "@repo/ui/components/button";
import { FormInput } from "@repo/ui/components/case/form-input";
import { type FormEvent, useActionState } from "react";
import { useForm } from "react-hook-form";

export default function CreateForm() {
  const [state, dispatch, isPending] = useActionState<
    ActionState<never> | undefined,
    FormData
  >(createPost, undefined);

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm({ resolver: zodResolver(zCreatePost) });

  const validate = async (e: FormEvent<HTMLFormElement>) => {
    const result = zCreatePost.safeParse(getValues());
    if (!result.success) {
      e.preventDefault();
    }
    await handleSubmit(() => {})();
  };

  return (
    <form action={dispatch} onSubmit={validate}>
      <div className="flex flex-col gap-2">
        <FormInput
          label="Title"
          id="title"
          {...register("title")}
          placeholder="Title"
          type="text"
          errorMessage={errors.title?.message}
        />
        <FormInput
          label="Content"
          id="content"
          {...register("content")}
          placeholder="Content"
          type="text"
          errorMessage={errors.content?.message}
        />
        {state?.ok === false && (
          <Message variant="destructive">{state.error.message}</Message>
        )}
        <Button
          disabled={Object.keys(errors).length > 0 || isPending}
          type="submit"
        >
          Create Post
        </Button>
      </div>
    </form>
  );
}
