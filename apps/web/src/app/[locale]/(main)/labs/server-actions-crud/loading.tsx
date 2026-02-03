import { getLocale, getTranslations } from "next-intl/server";

import { Message } from "@o3osatoshi/ui";

export default async function Loading() {
  const locale = await getLocale();
  const t = await getTranslations({ namespace: "Common", locale });

  return <Message>{t("loading")}</Message>;
}
