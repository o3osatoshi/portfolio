import type * as React from "react";
import { Label } from "@/components/index.client";
import { Input, Message } from "@/components/index.server";
import { cn } from "@/lib/utils";

type Props = React.ComponentProps<"input"> & {
  label: string;
  errorMessage?: string | undefined;
};

export function FormInput({
  className,
  errorMessage,
  id,
  label,
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
