import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function TextBlock({ children }: Props) {
  return <div className="space-y-3 text-muted-foreground">{children}</div>;
}
