import { prisma } from "@repo/prisma";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const authorId = searchParams.get("authorId");

  console.log(`[GET /labs/posts] called with authorId=${authorId ?? "none"}`);

  const posts = await prisma.post.findMany({
    ...(authorId !== null && { where: { authorId } }),
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (posts === undefined || posts === null) {
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }

  return Response.json(posts);
}
