import { defineRouting } from "next-intl/routing";

export const defaultLocale = "en";

export const routing = defineRouting({
  defaultLocale,
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365,
  },
  localeDetection: true,
  localePrefix: "always",
  locales: ["en", "ja"],
});

export type Locale = (typeof routing.locales)[number];
