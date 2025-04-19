import { err, ok, Result, ResultAsync } from "neverthrow";
import { z } from "zod";
import { fetchClient } from "@/utils/fetch-client";

const baseSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const userSchema = baseSchema.extend({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  emailVerified: z.coerce.date().optional(),
  image: z.string().url().optional(),
});

const postSchema = baseSchema.extend({
  id: z.number(),
  title: z.string(),
  content: z.string().nullable(),
  published: z.coerce.boolean(),
  authorId: z.string(),
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
}: Props | undefined = {}): Promise<Result<z.infer<typeof schema>, Error>> {
  return ResultAsync.fromPromise(
    fetchClient({
      pathName: "/api/core/posts",
      search: authorId === undefined ? undefined : { authorId: authorId },
    }),
    (error: unknown) => {
      if (error instanceof Error) {
        return error;
      }
      return new Error("unknown error");
    },
  ).andThen((data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      console.error(result.error);
      return err(result.error);
    }
    return ok(result.data);
  });
}
