"use client";

import { AuthProvider } from "@repo/auth/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
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
