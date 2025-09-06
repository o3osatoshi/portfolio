"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
} from "@o3osatoshi/ui";
import { signIn } from "next-auth/react";

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign in/up to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            className="w-full"
            onClick={() => signIn("google", { redirectTo: "/" })}
            variant="outline"
          >
            Sign in/up with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
