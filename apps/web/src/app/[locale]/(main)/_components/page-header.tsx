import type { ReactNode } from "react";

import { Heading } from "@o3osatoshi/ui";

interface Props {
  actions?: ReactNode;
  description?: ReactNode;
  title: ReactNode;
}

export default function PageHeader({ actions, description, title }: Props) {
  return (
    <header className="space-y-2">
      <Heading className="text-3xl md:text-4xl lg:text-4xl" level="h1">
        {title}
      </Heading>
      {description ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
      {actions ? <div className="pt-2">{actions}</div> : null}
    </header>
  );
}
