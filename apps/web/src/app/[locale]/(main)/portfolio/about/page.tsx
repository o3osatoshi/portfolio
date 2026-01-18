import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
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

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      <PageSection title={t("sections.skills.title")}>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li className="flex flex-wrap gap-1">
            <span className="font-medium text-foreground">
              {t("sections.skills.items.frontend.label")}
            </span>
            <span>{t("sections.skills.items.frontend.details")}</span>
          </li>
          <li className="flex flex-wrap gap-1">
            <span className="font-medium text-foreground">
              {t("sections.skills.items.web3.label")}
            </span>
            <span>{t("sections.skills.items.web3.details")}</span>
          </li>
          <li className="flex flex-wrap gap-1">
            <span className="font-medium text-foreground">
              {t("sections.skills.items.backend.label")}
            </span>
            <span>{t("sections.skills.items.backend.details")}</span>
          </li>
          <li className="flex flex-wrap gap-1">
            <span className="font-medium text-foreground">
              {t("sections.skills.items.quality.label")}
            </span>
            <span>{t("sections.skills.items.quality.details")}</span>
          </li>
        </ul>
      </PageSection>

      <PageSection title={t("sections.experience.title")}>
        <ul className="space-y-4">
          <li>
            <span className="font-medium text-foreground">
              {t("sections.experience.items.napier.title")}
            </span>
            <div className="text-muted-foreground">
              {t("sections.experience.items.napier.description")}
            </div>
          </li>
          <li>
            <span className="font-medium text-foreground">
              {t("sections.experience.items.salon.title")}
            </span>
            <div className="text-muted-foreground">
              {t("sections.experience.items.salon.description")}
            </div>
          </li>
          <li>
            <span className="font-medium text-foreground">
              {t("sections.experience.items.softbankResearch.title")}
            </span>
            <div className="text-muted-foreground">
              {t("sections.experience.items.softbankResearch.description")}
            </div>
          </li>
          <li>
            <span className="font-medium text-foreground">
              {t("sections.experience.items.softbankPm.title")}
            </span>
            <div className="text-muted-foreground">
              {t("sections.experience.items.softbankPm.description")}
            </div>
          </li>
        </ul>
      </PageSection>

      <PageSection title={t("sections.education.title")}>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>{t("sections.education.items.tokyo")}</li>
          <li>{t("sections.education.items.rikkyo")}</li>
        </ul>
      </PageSection>
    </>
  );
}
