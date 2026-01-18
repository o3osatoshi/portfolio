import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";

type SkillSection = {
  items: string[];
  key: string;
  title: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "PortfolioSkills", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("PortfolioSkills");
  const sections: SkillSection[] = [
    {
      items: [
        t("sections.frontend.items.first"),
        t("sections.frontend.items.second"),
        t("sections.frontend.items.third"),
        t("sections.frontend.items.fourth"),
        t("sections.frontend.items.fifth"),
      ],
      key: "frontend",
      title: t("sections.frontend.title"),
    },
    {
      items: [
        t("sections.backend.items.first"),
        t("sections.backend.items.second"),
        t("sections.backend.items.third"),
      ],
      key: "backend",
      title: t("sections.backend.title"),
    },
    {
      items: [
        t("sections.infrastructure.items.first"),
        t("sections.infrastructure.items.second"),
        t("sections.infrastructure.items.third"),
        t("sections.infrastructure.items.fourth"),
      ],
      key: "infrastructure",
      title: t("sections.infrastructure.title"),
    },
    {
      items: [
        t("sections.web3.items.first"),
        t("sections.web3.items.second"),
        t("sections.web3.items.third"),
        t("sections.web3.items.fourth"),
        t("sections.web3.items.fifth"),
      ],
      key: "web3",
      title: t("sections.web3.title"),
    },
    {
      items: [
        t("sections.tools.items.first"),
        t("sections.tools.items.second"),
        t("sections.tools.items.third"),
      ],
      key: "tools",
      title: t("sections.tools.title"),
    },
  ];

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      {sections.map((section) => (
        <PageSection key={section.key} title={section.title}>
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            {section.items.map((item, index) => (
              <li key={`${section.key}-${index}`}>{item}</li>
            ))}
          </ul>
        </PageSection>
      ))}
    </>
  );
}
