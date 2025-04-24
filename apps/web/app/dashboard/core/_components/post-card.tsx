import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

import DeleteButton from "@/app/dashboard/core/crud/_components/delete-button";
import EditDialog from "@/app/dashboard/core/crud/_components/edit-dialog";
import type { Post, User } from "@repo/db";

interface Props {
  post: Post & { author: Pick<User, "name"> };
}

export default function PostCard({ post }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>
        <CardDescription>
          <div className="flex gap-3">
            <span>{post.author.name}</span>
            <div className="flex gap-1.5">
              <span>{post.createdAt.toLocaleTimeString()}</span>
              <span>{post.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
        </CardDescription>
        <CardAction>
          <div className="flex gap-1">
            <EditDialog post={post} />
            <DeleteButton id={post.id} />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>{post.content}</p>
      </CardContent>
    </Card>
  );
}
