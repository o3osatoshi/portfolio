import type { PostExtend } from "@/app/(signedin)/core/_services/getPosts";
import DeleteButton from "@/app/(signedin)/core/crud/_components/delete-button";
import EditDialog from "@/app/(signedin)/core/crud/_components/edit-dialog";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

interface Props {
  post: PostExtend;
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
