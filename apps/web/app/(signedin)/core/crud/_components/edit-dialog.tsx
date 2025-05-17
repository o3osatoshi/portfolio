"use client";

import { updatePost } from "@/app/(signedin)/core/crud/_actions/update-post";
import type { ActionResult } from "@/utils/action-result";
import type { Post } from "@repo/database";
import Message from "@repo/ui/components/base/message";
import { Button } from "@repo/ui/components/button";
import { FormInput } from "@repo/ui/components/case/form-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Pencil } from "lucide-react";
import * as React from "react";
import { useActionState } from "react";

interface Props {
  post: Post;
}

export default function EditDialog({ post }: Props) {
  const [result, formAction, isLoading] = useActionState<
    ActionResult<never> | undefined,
    FormData
  >(updatePost, undefined);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={formAction}>
          <input name="id" type="hidden" value={post.id} />
          <DialogHeader>
            <DialogTitle>Edit post</DialogTitle>
            <DialogDescription>
              Make changes to your post here.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <FormInput
              label="Title"
              defaultValue={post.title}
              id="title"
              name="title"
              type="text"
            />
            <FormInput
              label="Content"
              defaultValue={post.content ?? ""}
              id="content"
              name="content"
              type="text"
            />
          </div>
          <DialogFooter>
            <div className="flex flex-col items-end gap-2">
              {result?.ok === false && (
                <Message variant="destructive">{result.error.message}</Message>
              )}
              <Button disabled={isLoading} type="submit" className="w-fit">
                Save changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
