import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { getPath } from "@/utils/nav-handler";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "ToolkitIndex", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("ToolkitIndex");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-semibold text-3xl">{t("title")}</h1>
        <p className="text-neutral-600">
          {t.rich("intro", {
            toolkit: (chunks) => <code>{chunks}</code>,
          })}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">{t("availableDemos")}</h2>
        <ul className="list-disc space-y-2 pl-5 text-neutral-600">
          <li>
            <Link href={getPath("toolkit-asynchronous")} className="underline">
              {t("asynchronousLink")}
            </Link>
          </li>
          <li>
            <Link href={getPath("toolkit-redis-cache")} className="underline">
              {t("redisCacheLink")}
            </Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
