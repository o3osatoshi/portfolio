import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import RedisCacheDemoCard from "@/app/[locale]/(main)/labs/edge-redis-cache/_components/redis-cache-demo";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "LabsEdgeRedisCache", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page({ params }: Props) {
  "use cache";
  cacheLife("staticPage");
  const { locale } = await params;
  const t = await getTranslations({ namespace: "LabsEdgeRedisCache", locale });

  return (
    <>
      <PageHeader
        description={t("header.description")}
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
