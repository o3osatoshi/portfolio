"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Circular avatar wrapper around Radix Avatar primitives.
 *
 * Ensures a consistent size and shape while exposing Radix features such as
 * lazy loading, fallbacks, and accessible semantics.
 *
 * @public
 */
function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
      data-slot="avatar"
      {...props}
    />
  );
}

/**
 * Graceful fallback displayed when the avatar image is missing or fails to load.
 *
 * @public
 */
function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center rounded-full bg-muted",
        className,
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

/** Styled `<img>` element that fills the avatar container.
 *
 * @public
 */
function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      className={cn("aspect-square size-full", className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

export { Avatar, AvatarFallback, AvatarImage };
