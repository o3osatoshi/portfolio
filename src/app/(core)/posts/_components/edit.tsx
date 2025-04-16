"use client";

import { Pencil } from "lucide-react";
import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { updatePost } from "@/app/(core)/posts/_actions/update-action";
import { Button } from "@/components/ui/button/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Post } from "@/prisma";
import { ActionResult, err } from "@/utils/action-result";

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
    toast.error(result.error.message);
  }
  return result;
};

interface Props {
  post: Post;
}

export default function Edit({ post }: Props) {
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
