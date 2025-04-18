import { Post, User } from "@/prisma";
import { handleFailed, handleSucceed } from "@/utils/fetch-result";

interface Props {
  authorId?: string;
}

export async function getPosts({
  authorId,
}: Props): Promise<(Post & { author: Pick<User, "name"> })[]> {
  const params = new URLSearchParams({
    ...(authorId !== undefined && { authorId }),
  });
  const path =
    authorId !== undefined
      ? `/api/core/posts?${params.toString()}`
      : "/api/core/posts";
  const url = `${process.env.API_BASE_URL}${path}`;

  return fetch(url, {
    next: { tags: [path] },
  })
    .then(handleSucceed)
    .catch(handleFailed);
}
