import "@o3osatoshi/ui/globals.css";

import { GoogleAnalytics } from "@next/third-parties/google";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { fontMono, fontSans, jetbrainsMono } from "@/app/fonts";
import { defaultLocale } from "@/i18n/routing";

const baseMetadata: Metadata = {
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
};

interface Props {
  children: ReactNode;
  params: Promise<{ locale?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    namespace: "Site",
    locale: locale ?? defaultLocale,
  });

  return {
    ...baseMetadata,
    description: t("description"),
    title: t("title"),
  };
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <html lang={locale ?? defaultLocale} suppressHydrationWarning>
      <GoogleAnalytics gaId="G-QFX9PV6BLQ" />
      <body
        className={`${fontSans.variable} ${fontMono.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
