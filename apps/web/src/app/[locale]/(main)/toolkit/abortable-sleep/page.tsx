import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import SleepDemoCard from "@/app/[locale]/(main)/toolkit/abortable-sleep/_components/sleep-demo";

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    namespace: "ToolkitAbortableSleep",
    locale,
  });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page({ params }: Props) {
  "use cache";
  cacheLife("staticPage");
  const { locale } = await params;
  const t = await getTranslations({
    namespace: "ToolkitAbortableSleep",
    locale,
  });
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
        <SleepDemoCard />
      </PageSection>
    </>
  );
}
