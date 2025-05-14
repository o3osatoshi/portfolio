"use client";

import { createPost } from "@/app/(signed)/core/crud/_actions/create-post";
import { type ActionResult, err } from "@/utils/action-result";
import { Alert, AlertTitle } from "@repo/ui/components/alert";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { AlertCircle } from "lucide-react";
import { useActionState } from "react";

const action = async (
  _: ActionResult<never> | undefined,
  formData: FormData,
): Promise<ActionResult<never>> => {
  const title = formData.get("title");
  const content = formData.get("content");
  if (typeof title !== "string" || typeof content !== "string") {
    return err("Required fields are missing.");
  }
  return await createPost(title, content);
};

export default function CreateForm() {
  const [result, formAction, isLoading] = useActionState<
    ActionResult<never> | undefined,
    FormData
  >(action, undefined);

  return (
    <form action={formAction}>
      <div className="flex flex-col gap-2">
        <Input name="title" placeholder="Title" type="text" />
        <Input name="content" placeholder="Content" type="text" />
        {result?.ok === false && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{result.error.message}</AlertTitle>
          </Alert>
        )}
        <Button disabled={isLoading} type="submit">
          Create Post
        </Button>
      </div>
    </form>
  );
}
