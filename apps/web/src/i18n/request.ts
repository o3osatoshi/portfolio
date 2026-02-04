import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";

import { routing } from "./routing";

export default getRequestConfig(async (params) => {
  const value = params.locale ?? routing.defaultLocale;
  const locale =
    value && hasLocale(routing.locales, value) ? value : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
