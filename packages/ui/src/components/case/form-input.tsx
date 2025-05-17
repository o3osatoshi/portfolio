import Message from "@repo/ui/components/base/message";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { cn } from "@repo/ui/lib/utils";
import type * as React from "react";

type Props = React.ComponentProps<"input"> & {
  label: string;
  errorMessage?: string | undefined;
};

export function FormInput({
  label,
  errorMessage,
  id,
  className,
  type,
  ...props
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-right" htmlFor={id}>
        {label}
      </Label>
      <Input id={id} type={type} className={cn(className)} {...props} />
      <Message variant="destructive">{errorMessage}</Message>
    </div>
  );
}
