import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import SleepDemoCard from "@/app/[locale]/(main)/toolkit/asynchronous/_components/sleep-demo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "ToolkitAsynchronous", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("ToolkitAsynchronous");
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
