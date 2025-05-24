import { type VariantProps, cva } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@repo/ui/lib/utils";

const headingVariants = cva("font-bold tracking-tight", {
  variants: {
    level: {
      h1: "text-4xl md:text-5xl lg:text-6xl",
      h2: "text-3xl md:text-4xl",
      h3: "text-2xl md:text-3xl",
      h4: "text-xl md:text-2xl",
      h5: "text-lg md:text-xl",
      h6: "text-base md:text-lg",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
    },
  },
  defaultVariants: {
    level: "h2",
    align: "left",
  },
});

type Props = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants>;

function Heading({
  className,
  level = "h2",
  align,
  children,
  ...props
}: Props) {
  const classes = cn(headingVariants({ level, align, className }));

  switch (level) {
    case "h1":
      return (
        <h1 className={classes} data-slot="heading" {...props}>
          {children}
        </h1>
      );
    case "h2":
      return (
        <h2 className={classes} data-slot="heading" {...props}>
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 className={classes} data-slot="heading" {...props}>
          {children}
        </h3>
      );
    case "h4":
      return (
        <h4 className={classes} data-slot="heading" {...props}>
          {children}
        </h4>
      );
    case "h5":
      return (
        <h5 className={classes} data-slot="heading" {...props}>
          {children}
        </h5>
      );
    case "h6":
      return (
        <h6 className={classes} data-slot="heading" {...props}>
          {children}
        </h6>
      );
    default:
      return (
        <h2 className={classes} data-slot="heading" {...props}>
          {children}
        </h2>
      );
  }
}

export { Heading, headingVariants };
