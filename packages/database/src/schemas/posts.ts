import { z } from "zod";
import { zBase } from "./common";
import { zUser } from "./users";

export const _zPost = zBase.extend({
  id: z.coerce.number(),
  title: z
    .string()
    .min(1, "At least 1 character long")
    .max(14, "Less than 15 characters"),
  content: z.string().nullable(),
  published: z.coerce.boolean(),
  authorId: z.string(),
});

export const zPost = _zPost.extend({
  author: zUser.pick({ name: true }),
});

export type Post = z.infer<typeof zPost>;

export const zPosts = z.array(zPost);

export type Posts = z.infer<typeof zPosts>;

export const zCreatePost = zPost.pick({ title: true, content: true });

export const zDeletePost = zPost.pick({ id: true });

export const zUpdatePost = zPost.pick({ id: true, title: true, content: true });
