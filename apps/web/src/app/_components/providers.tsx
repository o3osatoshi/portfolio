"use client";

import { AuthProvider } from "@repo/auth/react";
import { ThemeProvider } from "next-themes";
import { type ReactNode, useEffect } from "react";

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    if (process.env.NEXT_PUBLIC_MSW !== "1") return;

    void import("@/mocks/browser").then(({ worker }) =>
      worker.start({ onUnhandledRequest: "bypass" }),
    );
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        disableTransitionOnChange
        enableColorScheme
        enableSystem
      >
        {children}
      </ThemeProvider>
    </AuthProvider>
  );
}
