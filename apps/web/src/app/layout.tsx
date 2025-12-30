import "@o3osatoshi/ui/globals.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import type { ReactNode } from "react";

import { fontMono, fontSans, jetbrainsMono } from "@/app/fonts";

export const metadata: Metadata = {
  description: "o3osatoshi portfolio",
  icons: {
    apple: [
      {
        sizes: "180x180",
        type: "image/png",
        url: "/apple-touch-icon.png",
      },
    ],
    icon: [
      { sizes: "16x16", type: "image/png", url: "/favicon-16x16.png" },
      { sizes: "32x32", type: "image/png", url: "/favicon-32x32.png" },
      { sizes: "any", url: "/favicon.ico" },
    ],
    other: [
      {
        rel: "icon",
        sizes: "192x192",
        type: "image/png",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "icon",
        sizes: "512x512",
        type: "image/png",
        url: "/android-chrome-512x512.png",
      },
      { rel: "manifest", url: "/site.webmanifest" },
    ],
  },
  title: "o3osatoshi",
};

interface Props {
  children: ReactNode;
  params?: Promise<{ locale?: string }>;
}

export default async function Layout({ children, params }: Props) {
  const resolvedParams = await params;
  const locale = resolvedParams?.locale ?? "en";

  return (
    <html lang={locale} suppressHydrationWarning>
      <GoogleAnalytics gaId="G-QFX9PV6BLQ" />
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
