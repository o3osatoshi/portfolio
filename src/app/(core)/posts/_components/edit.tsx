"use client";

import { Pencil } from "lucide-react";
import * as React from "react";
import { useActionState } from "react";
import { ActionState } from "@/app/(core)/posts/_components/delete-button";
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

const action = async (
  _: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const id = formData.get("id");
  const title = formData.get("title");
  const content = formData.get("content");
  if (
    typeof id !== "string" ||
    typeof title !== "string" ||
    typeof content !== "string"
  )
    throw new Error("missing required params");
  return await updatePost(Number(id), title, content);
};

interface Props {
  post: Post;
}

export default function Edit({ post }: Props) {
  const [_, formAction, isLoading] = useActionState(action, {
    success: false,
  });

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
