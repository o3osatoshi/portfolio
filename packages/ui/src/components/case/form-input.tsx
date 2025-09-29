import type * as React from "react";

import { Label } from "@/components/index.client";
import { Input, Message } from "@/components/index.server";
import { cn } from "@/lib/utils";

type Props = {
  errorMessage?: string | undefined;
  label: string;
} & React.ComponentProps<"input">;

/**
 * Input field paired with a label and optional validation message.
 *
 * Designed for quick form scaffolding in portfolio demos where labels, inputs,
 * and error feedback are vertically stacked.
 */
export function FormInput({
  id,
  className,
  errorMessage,
  label,
  type,
  ...props
}: Props) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-right" htmlFor={id}>
        {label}
      </Label>
      <Input id={id} className={cn(className)} type={type} {...props} />
      <Message variant="destructive">{errorMessage}</Message>
    </div>
  );
}
