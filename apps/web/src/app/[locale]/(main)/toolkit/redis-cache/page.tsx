import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import RedisCacheDemoCard from "@/app/[locale]/(main)/toolkit/redis-cache/_components/redis-cache-demo";
import { Link } from "@/i18n/navigation";
import { getPath } from "@/utils/nav-handler";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "ToolkitRedisCache", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("ToolkitRedisCache");
  const tToolkit = await getTranslations("Toolkit");

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-semibold text-3xl">{t("title")}</h1>
        <p className="text-neutral-600">
          {t.rich("intro", {
            endpoint: (chunks) => <code>{chunks}</code>,
            integrations: (chunks) => <code>{chunks}</code>,
          })}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">{t("sectionTitle")}</h2>
        <p className="text-neutral-600">{t("sectionIntro")}</p>
        <RedisCacheDemoCard />
      </section>

      <footer className="text-neutral-600 text-sm">
        <Link href={getPath("toolkit")} className="underline">
          {tToolkit("backToIndex")}
        </Link>
      </footer>
    </div>
  );
}
