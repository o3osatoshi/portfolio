"use client";

import { updatePost } from "@/app/(main)/labs/server-crud/_actions/update-post";
import type { ActionState } from "@/utils/action-state";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Post } from "@repo/database";
import { zCreatePost, zUpdatePost } from "@repo/database/schemas";
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
import { type FormEvent, useActionState } from "react";
import { useForm } from "react-hook-form";

interface Props {
  post: Post;
}

export default function EditDialog({ post }: Props) {
  const [state, dispatch, isPending] = useActionState<
    ActionState<never> | undefined,
    FormData
  >(updatePost, undefined);

  const {
    register,
    formState: { errors },
    handleSubmit,
    getValues,
  } = useForm({ resolver: zodResolver(zUpdatePost) });

  const validate = async (e: FormEvent<HTMLFormElement>) => {
    const result = zUpdatePost.safeParse(getValues());
    if (!result.success) {
      e.preventDefault();
    }
    await handleSubmit(() => {})();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form action={dispatch} onSubmit={validate}>
          <input value={post.id} {...register("id")} type="hidden" />
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
              {...register("title")}
              type="text"
              errorMessage={errors.title?.message}
            />
            <FormInput
              label="Content"
              defaultValue={post.content ?? ""}
              id="content"
              {...register("content")}
              type="text"
              errorMessage={errors.content?.message}
            />
          </div>
          <DialogFooter>
            <div className="flex flex-col items-end gap-2">
              {state?.ok === false && (
                <Message variant="destructive">{state.error.message}</Message>
              )}
              <Button
                disabled={Object.keys(errors).length > 0 || isPending}
                type="submit"
                className="w-fit"
              >
                Save changes
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
