import { SpeedInsights } from "@vercel/speed-insights/next";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import Providers from "@/app/_components/providers";
import WebVitals from "@/app/_components/web-vitals";
import { routing } from "@/i18n/routing";

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SpeedInsights />
      <WebVitals />
      <Providers>{children}</Providers>
    </NextIntlClientProvider>
  );
}
