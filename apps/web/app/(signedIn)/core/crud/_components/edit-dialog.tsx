"use client";

import { updatePost } from "@/app/(signedIn)/core/crud/_actions/update-post";
import { type ActionResult, err } from "@/utils/action-result";
import type { Post } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { Pencil } from "lucide-react";
import * as React from "react";
import { useActionState } from "react";

const action = async (
  _: ActionResult<never> | undefined,
  formData: FormData,
): Promise<ActionResult<never>> => {
  const id = formData.get("id");
  const title = formData.get("title");
  const content = formData.get("content");
  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof content !== "string"
  ) {
    return err("Required fields are missing.");
  }
  const result = await updatePost(Number(id), title, content);
  if (!result.ok) {
    console.log(result.error.message);
  }
  return result;
};

interface Props {
  post: Post;
}

export default function EditDialog({ post }: Props) {
  const [_, formAction, isLoading] = useActionState<
    ActionResult<never> | undefined,
    FormData
  >(action, undefined);

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
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="title">
                Title
              </Label>
              <Input
                className="col-span-3"
                defaultValue={post.title}
                id="title"
                name="title"
                type="text"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right" htmlFor="content">
                Content
              </Label>
              <Input
                className="col-span-3"
                defaultValue={post.content ?? ""}
                id="content"
                name="content"
                type="text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isLoading} type="submit">
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
