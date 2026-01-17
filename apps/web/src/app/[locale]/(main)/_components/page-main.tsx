import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function PageMain({ children }: Props) {
  return (
    <main className="mx-auto w-full max-w-3xl space-y-8 px-4 py-10">
      {children}
    </main>
  );
}
