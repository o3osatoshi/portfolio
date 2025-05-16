import { z } from "zod";
import { zBase } from "./common";
import { zUser } from "./users";

export const _zPost = zBase.extend({
  id: z.number(),
  title: z.string(),
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
