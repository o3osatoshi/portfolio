import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

/** Variant map controlling typography scale and alignment for {@link Heading}. */
const headingVariants = cva("font-bold tracking-tight", {
  defaultVariants: {
    align: "left",
    level: "h2",
  },
  variants: {
    align: {
      center: "text-center",
      left: "text-left",
      right: "text-right",
    },
    level: {
      h1: "text-4xl md:text-5xl lg:text-6xl",
      h2: "text-3xl md:text-4xl",
      h3: "text-2xl md:text-3xl",
      h4: "text-xl md:text-2xl",
      h5: "text-lg md:text-xl",
      h6: "text-base md:text-lg",
    },
  },
});

type Props = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants>;

/**
 * Typography helper that renders semantic heading levels with gradient sizing.
 *
 * Choose the `level` prop to control the rendered element and corresponding
 * Tailwind scale. Alignment options adjust text justification without
 * requiring additional wrappers.
 */
function Heading({
  align,
  children,
  className,
  level = "h2",
  ...props
}: Props) {
  const classes = cn(headingVariants({ align, className, level }));

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
