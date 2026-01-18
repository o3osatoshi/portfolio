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
  const t = await getTranslations({ namespace: "PortfolioAbout", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("PortfolioAbout");
  const interests = [
    t("sections.interests.items.frontend"),
    t("sections.interests.items.web3"),
    t("sections.interests.items.product"),
    t("sections.interests.items.tools"),
  ];

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      <PageSection>
        <TextBlock>
          <p>{t("sections.summary.paragraphs.first")}</p>
        </TextBlock>
      </PageSection>

      <PageSection title={t("sections.interests.title")}>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          {interests.map((interest) => (
            <li key={interest}>{interest}</li>
          ))}
        </ul>
      </PageSection>
    </>
  );
}
