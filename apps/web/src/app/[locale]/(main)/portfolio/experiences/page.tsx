import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { cacheLife } from "next/cache";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";

type ExperienceItem = {
  company: string;
  contributions: string[];
  key: string;
  knowledge: string[];
  period: string;
  product: string;
  role: string;
  stack: string;
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
  const t = await getTranslations({
    namespace: "PortfolioExperiences",
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
    namespace: "PortfolioExperiences",
    locale,
  });
  const labels = {
    contributions: t("sections.labels.contributions"),
    knowledge: t("sections.labels.knowledge"),
    product: t("sections.labels.product"),
    stack: t("sections.labels.stack"),
  };
  const experiences: ExperienceItem[] = [
    {
      company: t("sections.items.napier.company"),
      contributions: [
        t("sections.items.napier.contributions.first"),
        t("sections.items.napier.contributions.second"),
      ],
      key: "napier",
      knowledge: [
        t("sections.items.napier.knowledge.first"),
        t("sections.items.napier.knowledge.second"),
        t("sections.items.napier.knowledge.third"),
        t("sections.items.napier.knowledge.fourth"),
      ],
      period: t("sections.items.napier.period"),
      product: t("sections.items.napier.product"),
      role: t("sections.items.napier.role"),
      stack: t("sections.items.napier.stack"),
    },
    {
      company: t("sections.items.salon.company"),
      contributions: [
        t("sections.items.salon.contributions.first"),
        t("sections.items.salon.contributions.second"),
      ],
      key: "salon",
      knowledge: [
        t("sections.items.salon.knowledge.first"),
        t("sections.items.salon.knowledge.second"),
        t("sections.items.salon.knowledge.third"),
      ],
      period: t("sections.items.salon.period"),
      product: t("sections.items.salon.product"),
      role: t("sections.items.salon.role"),
      stack: t("sections.items.salon.stack"),
    },
    {
      company: t("sections.items.softbankResearch.company"),
      contributions: [
        t("sections.items.softbankResearch.contributions.first"),
        t("sections.items.softbankResearch.contributions.second"),
        t("sections.items.softbankResearch.contributions.third"),
      ],
      key: "softbank-research",
      knowledge: [
        t("sections.items.softbankResearch.knowledge.first"),
        t("sections.items.softbankResearch.knowledge.second"),
      ],
      period: t("sections.items.softbankResearch.period"),
      product: t("sections.items.softbankResearch.product"),
      role: t("sections.items.softbankResearch.role"),
      stack: t("sections.items.softbankResearch.stack"),
    },
    {
      company: t("sections.items.softbankPm.company"),
      contributions: [
        t("sections.items.softbankPm.contributions.first"),
        t("sections.items.softbankPm.contributions.second"),
      ],
      key: "softbank-pm",
      knowledge: [
        t("sections.items.softbankPm.knowledge.first"),
        t("sections.items.softbankPm.knowledge.second"),
        t("sections.items.softbankPm.knowledge.third"),
      ],
      period: t("sections.items.softbankPm.period"),
      product: t("sections.items.softbankPm.product"),
      role: t("sections.items.softbankPm.role"),
      stack: t("sections.items.softbankPm.stack"),
    },
    {
      company: t("sections.items.innoventure.company"),
      contributions: [t("sections.items.innoventure.contributions.first")],
      key: "innoventure",
      knowledge: [
        t("sections.items.innoventure.knowledge.first"),
        t("sections.items.innoventure.knowledge.second"),
        t("sections.items.innoventure.knowledge.third"),
        t("sections.items.innoventure.knowledge.fourth"),
      ],
      period: t("sections.items.innoventure.period"),
      product: t("sections.items.innoventure.product"),
      role: t("sections.items.innoventure.role"),
      stack: t("sections.items.innoventure.stack"),
    },
  ];

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      <div className="space-y-8">
        {experiences.map((experience) => (
          <PageSection
            key={experience.key}
            description={`${experience.period} / ${experience.company}`}
            title={experience.role}
          >
            <dl className="space-y-4 text-muted-foreground">
              <div>
                <dt className="font-medium text-foreground">
                  {labels.product}
                </dt>
                <dd>{experience.product}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {labels.contributions}
                </dt>
                <dd>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    {experience.contributions.map((item, index) => (
                      <li key={`${experience.key}-${index}`}>{item}</li>
                    ))}
                  </ul>
                </dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">{labels.stack}</dt>
                <dd>{experience.stack}</dd>
              </div>
              <div>
                <dt className="font-medium text-foreground">
                  {labels.knowledge}
                </dt>
                <dd>
                  <ul className="mt-2 list-disc space-y-2 pl-6">
                    {experience.knowledge.map((item, index) => (
                      <li key={`${experience.key}-knowledge-${index}`}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </PageSection>
        ))}
      </div>
    </>
  );
}
