import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import TextBlock from "@/app/[locale]/(main)/_components/text-block";
import { Button } from "@o3osatoshi/ui";

type EducationItem = {
  details: {
    label?: string;
    text: string;
    url?: string;
  }[];
  key: string;
  period: string;
  title: string;
};

interface Props {
  params: Promise<{ locale: string }>;
}

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

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "PortfolioEducation", locale });
  const items: EducationItem[] = [
    {
      details: [
        {
          label: t("sections.items.tokyo.details.first.label"),
          text: t("sections.items.tokyo.details.first.text"),
          url: t("sections.items.tokyo.details.first.url"),
        },
        {
          label: t("sections.items.tokyo.details.second.label"),
          text: t("sections.items.tokyo.details.second.text"),
          url: t("sections.items.tokyo.details.second.url"),
        },
        {
          label: t("sections.items.tokyo.details.third.label"),
          text: t("sections.items.tokyo.details.third.text"),
          url: t("sections.items.tokyo.details.third.url"),
        },
      ],
      key: "tokyo",
      period: t("sections.items.tokyo.period"),
      title: t("sections.items.tokyo.title"),
    },
    {
      details: [
        {
          label: t("sections.items.rikkyo.details.first.label"),
          text: t("sections.items.rikkyo.details.first.text"),
          url: t("sections.items.rikkyo.details.first.url"),
        },
        {
          label: t("sections.items.rikkyo.details.second.label"),
          text: t("sections.items.rikkyo.details.second.text"),
          url: t("sections.items.rikkyo.details.second.url"),
        },
        {
          label: t("sections.items.rikkyo.details.third.label"),
          text: t("sections.items.rikkyo.details.third.text"),
          url: t("sections.items.rikkyo.details.third.url"),
        },
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
              <div
                key={`${item.key}-${index}`}
                className="flex flex-wrap items-center gap-2"
              >
                <span>{detail.text}</span>
                {detail.url && detail.label ? (
                  <Button asChild className="h-auto p-0" variant="link">
                    <a href={detail.url} rel="noreferrer" target="_blank">
                      {detail.label}
                    </a>
                  </Button>
                ) : null}
              </div>
            ))}
          </TextBlock>
        </PageSection>
      ))}
    </>
  );
}
