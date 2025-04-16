"use client";

import { useActionState } from "react";
import { createPost } from "@/app/(core)/posts/_actions/create-action";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";
import { ActionResult, err } from "@/utils/action-result";

const action = async (
  _: ActionResult<null> | undefined,
  formData: FormData,
): Promise<ActionResult<null>> => {
  const title = formData.get("title");
  const content = formData.get("content");
  if (typeof title !== "string" || typeof content !== "string") {
    return err("missing required params");
  }
  return await createPost(title, content);
};

export default function CreateForm() {
  const [_, formAction, isLoading] = useActionState<
    ActionResult<null> | undefined,
    FormData
  >(action, undefined);

  console.log("_", _);

  return (
    <form action={formAction}>
      <div className="flex flex-col gap-2">
        <Input name="title" placeholder="Title" type="text" />
        <Input name="content" placeholder="Content" type="text" />
        <Button disabled={isLoading} type="submit">
          Create Post
        </Button>
      </div>
    </form>
  );
}
