import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";

type ExperienceItem = {
  key: string;
  period: string;
  product: string;
  responsibilities: string[];
  stack: string;
  title: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    namespace: "PortfolioExperiences",
    locale,
  });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("PortfolioExperiences");
  const labels = {
    product: t("sections.labels.product"),
    responsibilities: t("sections.labels.responsibilities"),
    stack: t("sections.labels.stack"),
  };
  const experiences: ExperienceItem[] = [
    {
      key: "napier",
      period: t("sections.items.napier.period"),
      product: t("sections.items.napier.product"),
      responsibilities: [
        t("sections.items.napier.responsibilities.first"),
        t("sections.items.napier.responsibilities.second"),
        t("sections.items.napier.responsibilities.third"),
      ],
      stack: t("sections.items.napier.stack"),
      title: t("sections.items.napier.title"),
    },
    {
      key: "salon",
      period: t("sections.items.salon.period"),
      product: t("sections.items.salon.product"),
      responsibilities: [
        t("sections.items.salon.responsibilities.first"),
        t("sections.items.salon.responsibilities.second"),
      ],
      stack: t("sections.items.salon.stack"),
      title: t("sections.items.salon.title"),
    },
    {
      key: "softbank-research",
      period: t("sections.items.softbankResearch.period"),
      product: t("sections.items.softbankResearch.product"),
      responsibilities: [
        t("sections.items.softbankResearch.responsibilities.first"),
        t("sections.items.softbankResearch.responsibilities.second"),
        t("sections.items.softbankResearch.responsibilities.third"),
      ],
      stack: t("sections.items.softbankResearch.stack"),
      title: t("sections.items.softbankResearch.title"),
    },
    {
      key: "softbank-pm",
      period: t("sections.items.softbankPm.period"),
      product: t("sections.items.softbankPm.product"),
      responsibilities: [
        t("sections.items.softbankPm.responsibilities.first"),
        t("sections.items.softbankPm.responsibilities.second"),
        t("sections.items.softbankPm.responsibilities.third"),
      ],
      stack: t("sections.items.softbankPm.stack"),
      title: t("sections.items.softbankPm.title"),
    },
    {
      key: "innoventure",
      period: t("sections.items.innoventure.period"),
      product: t("sections.items.innoventure.product"),
      responsibilities: [
        t("sections.items.innoventure.responsibilities.first"),
      ],
      stack: t("sections.items.innoventure.stack"),
      title: t("sections.items.innoventure.title"),
    },
  ];

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      {experiences.map((experience) => (
        <PageSection
          key={experience.key}
          description={experience.period}
          title={experience.title}
        >
          <dl className="space-y-4 text-muted-foreground">
            <div>
              <dt className="font-medium text-foreground">{labels.product}</dt>
              <dd>{experience.product}</dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">
                {labels.responsibilities}
              </dt>
              <dd>
                <ul className="mt-2 list-disc space-y-2 pl-6">
                  {experience.responsibilities.map((item, index) => (
                    <li key={`${experience.key}-${index}`}>{item}</li>
                  ))}
                </ul>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-foreground">{labels.stack}</dt>
              <dd>{experience.stack}</dd>
            </div>
          </dl>
        </PageSection>
      ))}
    </>
  );
}
