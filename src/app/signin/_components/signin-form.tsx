"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
