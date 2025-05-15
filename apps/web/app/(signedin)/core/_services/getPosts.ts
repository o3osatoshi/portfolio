import { fetchClient } from "@/utils/fetch-client";
import { type Result, ResultAsync, err, ok } from "neverthrow";
import { z } from "zod";

const zBase = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const zUser = zBase.extend({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  emailVerified: z.coerce.date().optional(),
  image: z.string().url().optional(),
});

const zPost = zBase.extend({
  id: z.number(),
  title: z.string(),
  content: z.string().nullable(),
  published: z.coerce.boolean(),
  authorId: z.string(),
});

const zPostExtend = zPost.extend({
  author: zUser.pick({ name: true }),
});

export type PostExtend = z.infer<typeof zPostExtend>;

const zPosts = z.array(zPostExtend);

type Posts = z.infer<typeof zPosts>;

interface Props {
  authorId?: string;
}

export async function getPosts({
  authorId,
}: Props | undefined = {}): Promise<Result<Posts, Error>> {
  const search = authorId === undefined ? undefined : { authorId: authorId };
  return ResultAsync.fromPromise(
    fetchClient({
      pathName: "/api/core/posts",
      search,
      cache: "force-cache",
    }),
    (error: unknown) => {
      if (error instanceof Error) {
        return error;
      }
      return new Error("unknown error");
    },
  ).andThen((data) => {
    const result = zPosts.safeParse(data);
    if (!result.success) {
      console.error(result.error);
      return err(result.error);
    }
    return ok(result.data);
  });
}
