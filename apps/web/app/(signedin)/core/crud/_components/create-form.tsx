"use client";

import { createPost } from "@/app/(signedin)/core/crud/_actions/create-post";
import type { ActionResult } from "@/utils/action-result";
import Message from "@repo/ui/components/base/message";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { useActionState } from "react";

export default function CreateForm() {
  const [result, formAction, isLoading] = useActionState<
    ActionResult<never> | undefined,
    FormData
  >(createPost, undefined);

  return (
    <form action={formAction}>
      <div className="flex flex-col gap-2">
        <Input name="title" placeholder="Title" type="text" />
        <Input name="content" placeholder="Content" type="text" />
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
