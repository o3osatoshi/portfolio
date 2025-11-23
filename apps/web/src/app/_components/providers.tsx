"use client";

import { AuthProvider } from "@repo/auth/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function Providers({ children }: Props) {
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
