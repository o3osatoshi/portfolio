"use client";

import { createPost } from "@/app/(signedin)/core/crud/_actions/create-post";
import type { ActionResult } from "@/utils/action-result";
import Message from "@repo/ui/components/base/message";
import { Button } from "@repo/ui/components/button";
import { FormInput } from "@repo/ui/components/case/form-input";
import { useActionState } from "react";

export default function CreateForm() {
  const [result, formAction, isLoading] = useActionState<
    ActionResult<never> | undefined,
    FormData
  >(createPost, undefined);

  return (
    <form action={formAction}>
      <div className="flex flex-col gap-2">
        <FormInput
          label="Title"
          id="title"
          name="title"
          placeholder="Title"
          type="text"
        />
        <FormInput
          label="Content"
          id="content"
          name="content"
          placeholder="Content"
          type="text"
        />
        {result?.ok === false && (
          <Message variant="destructive">{result.error.message}</Message>
        )}
        <Button disabled={isLoading} type="submit">
          Create Post
        </Button>
      </div>
    </form>
  );
}
