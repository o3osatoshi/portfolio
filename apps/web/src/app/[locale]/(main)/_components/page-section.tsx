import type { ReactNode } from "react";

import { Heading } from "@o3osatoshi/ui";

interface Props {
  children: ReactNode;
  description?: ReactNode;
  title?: ReactNode;
}

export default function PageSection({ children, description, title }: Props) {
  return (
    <section className="space-y-3">
      {title ? (
        <Heading
          className="font-semibold text-xl md:text-2xl lg:text-2xl"
          level="h2"
        >
          {title}
        </Heading>
      ) : null}
      {description ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
      {children}
    </section>
  );
}
