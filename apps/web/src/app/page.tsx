import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { type Locale, routing } from "@/i18n/routing";

const localeSet: Set<string> = new Set(routing.locales);

const localeDetectionEnabled = routing.localeDetection !== false;
const localeCookieName =
  typeof routing.localeCookie === "object" && routing.localeCookie?.name
    ? routing.localeCookie.name
    : "NEXT_LOCALE";

export default async function Page() {
  const locale =
    (await getLocaleFromCookie()) ??
    (await getLocaleFromAcceptLanguage()) ??
    routing.defaultLocale;

  redirect(`/${locale}`);
}

async function getLocaleFromAcceptLanguage(): Promise<Locale | undefined> {
  if (!localeDetectionEnabled) return undefined;

  const headerStore = await headers();
  const value = headerStore.get("accept-language");
  if (!value) return undefined;

  const tags = parseAcceptLanguage(value);
  for (const tag of tags) {
    const matched = normalizeLocale(tag);
    if (matched) return matched;
  }

  return undefined;
}

async function getLocaleFromCookie(): Promise<Locale | undefined> {
  if (!localeDetectionEnabled || routing.localeCookie === false)
    return undefined;

  const cookieStore = await cookies();
  const value = cookieStore.get(localeCookieName)?.value;
  if (!value) return undefined;
  return normalizeLocale(value);
}

function isLocale(value: string | undefined): value is Locale {
  if (!value) return false;
  return localeSet.has(value);
}

function normalizeLocale(tag: string): Locale | undefined {
  const lower = tag.toLowerCase();
  if (isLocale(lower)) return lower;

  const base = lower.split("-")[0];
  if (isLocale(base)) return base;

  return undefined;
}

function parseAcceptLanguage(value: string): string[] {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [tag, qValue] = part.split(";q=");
      const quality = qValue ? Number(qValue) : 1;
      return {
        quality: Number.isNaN(quality) ? 0 : quality,
        tag: tag?.toLowerCase(),
      };
    })
    .filter((item) => item.tag && item.tag !== "*")
    .sort((a, b) => b.quality - a.quality)
    .map((item) => item.tag)
    .filter((tag): tag is string => Boolean(tag));
}
