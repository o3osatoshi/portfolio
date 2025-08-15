import { fetchClient } from "@/utils/fetch-client";
import { getPathName } from "@/utils/handle-nav";
import { type Posts, zPosts } from "@repo/rdb/schemas";
import { type Result, ResultAsync, err, ok } from "neverthrow";

interface Props {
  authorId?: string;
}

export async function getPosts({
  authorId,
}: Props | undefined = {}): Promise<Result<Posts, Error>> {
  const search = authorId === undefined ? undefined : { authorId: authorId };
  return ResultAsync.fromPromise(
    fetchClient({
      pathName: getPathName("labs-posts"),
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
