import { Result, ResultAsync } from "neverthrow";
import { z } from "zod";
import { fetchClient } from "@/utils/fetch-client";

const userSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  emailVerified: z.coerce.date().optional(),
  image: z.string().url().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string().nullable(),
  published: z.coerce.boolean(),
  authorId: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const schema = z.array(
  postSchema.extend({
    author: userSchema.pick({ name: true }),
  }),
);

interface Props {
  authorId?: string;
}

export async function getPosts({
  authorId,
}: Props): Promise<Result<z.infer<typeof schema>, Error>> {
  return ResultAsync.fromPromise(
    fetchClient({ pathName: "/api/core/posts", search: authorId }),
    (error: unknown) => {
      if (error instanceof Error) {
        return error;
      }
      return new Error("unknown error");
    },
  ).map((data) => {
    console.log("data", data);
    return schema.parse(data);
  });
}
