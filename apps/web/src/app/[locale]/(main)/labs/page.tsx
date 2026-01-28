import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import TextBlock from "@/app/[locale]/(main)/_components/text-block";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "Labs", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("Labs");

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      <PageSection>
        <TextBlock>
          <p>{t("sections.summary.paragraphs.first")}</p>
          <p>{t("sections.summary.paragraphs.second")}</p>
          <p>{t("sections.summary.paragraphs.note")}</p>
        </TextBlock>
      </PageSection>
    </>
  );
}
