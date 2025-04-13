"use client";

import { useActionState } from "react";
import { createPost } from "@/app/(core)/posts/_components/create-action";
import { ActionState } from "@/app/(core)/posts/_components/delete-button";
import { Button } from "@/components/ui/button/button";
import { Input } from "@/components/ui/input";

const action = async (
  _: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const title = formData.get("title");
  const content = formData.get("content");
  if (typeof title !== "string" || typeof content !== "string")
    throw new Error("missing required params");
  return await createPost(title, content);
};

export default function CreateForm() {
  const [_, formAction, isLoading] = useActionState(action, {
    success: false,
  });

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
