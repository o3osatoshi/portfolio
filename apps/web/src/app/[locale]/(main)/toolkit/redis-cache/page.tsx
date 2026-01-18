import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import RedisCacheDemoCard from "@/app/[locale]/(main)/toolkit/redis-cache/_components/redis-cache-demo";

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
  return (
    <>
      <PageHeader
        description={t.rich("header.description", {
          endpoint: (chunks) => <code>{chunks}</code>,
          integrations: (chunks) => <code>{chunks}</code>,
        })}
        title={t("header.title")}
      />

      <PageSection
        description={t("sections.demo.description")}
        title={t("sections.demo.title")}
      >
        <RedisCacheDemoCard />
      </PageSection>
    </>
  );
}
