"use client";

import { AlertCircle } from "lucide-react";
import { useActionState } from "react";
import { createPost } from "@/app/(signedin)/core/crud/_actions/create-post";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ActionResult, err } from "@/utils/action-result";

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
