import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
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
    <>
      <PageHeader
        description={t.rich("intro", {
          endpoint: (chunks) => <code>{chunks}</code>,
          integrations: (chunks) => <code>{chunks}</code>,
        })}
        title={t("title")}
      />

      <PageSection description={t("sectionIntro")} title={t("sectionTitle")}>
        <RedisCacheDemoCard />
      </PageSection>

      <footer className="text-neutral-600 text-sm">
        <Link href={getPath("toolkit")} className="underline">
          {tToolkit("backToIndex")}
        </Link>
      </footer>
    </>
  );
}
