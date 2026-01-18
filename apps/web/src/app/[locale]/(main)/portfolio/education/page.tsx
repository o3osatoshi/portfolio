import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import TextBlock from "@/app/[locale]/(main)/_components/text-block";

type EducationItem = {
  details: string[];
  key: string;
  period: string;
  title: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "PortfolioEducation", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("PortfolioEducation");
  const items: EducationItem[] = [
    {
      details: [
        t("sections.items.tokyo.details.first"),
        t("sections.items.tokyo.details.second"),
        t("sections.items.tokyo.details.third"),
      ],
      key: "tokyo",
      period: t("sections.items.tokyo.period"),
      title: t("sections.items.tokyo.title"),
    },
    {
      details: [
        t("sections.items.rikkyo.details.first"),
        t("sections.items.rikkyo.details.second"),
        t("sections.items.rikkyo.details.third"),
      ],
      key: "rikkyo",
      period: t("sections.items.rikkyo.period"),
      title: t("sections.items.rikkyo.title"),
    },
  ];

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      {items.map((item) => (
        <PageSection
          key={item.key}
          description={item.period}
          title={item.title}
        >
          <TextBlock>
            {item.details.map((detail, index) => (
              <p key={`${item.key}-${index}`}>{detail}</p>
            ))}
          </TextBlock>
        </PageSection>
      ))}
    </>
  );
}
