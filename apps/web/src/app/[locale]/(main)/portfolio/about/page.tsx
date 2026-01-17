import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import { Button } from "@o3osatoshi/ui";
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
      <PageHeader description={t("intro")} title={t("title")} />

      <PageSection title={t("skillsTitle")}>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li className="flex flex-wrap gap-1">
            <span className="font-medium text-foreground">
              {t("skills.frontend")}
            </span>
            <span>{t("skills.frontendItems")}</span>
          </li>
          <li className="flex flex-wrap gap-1">
            <span className="font-medium text-foreground">
              {t("skills.web3")}
            </span>
            <span>{t("skills.web3Items")}</span>
          </li>
          <li className="flex flex-wrap gap-1">
            <span className="font-medium text-foreground">
              {t("skills.backend")}
            </span>
            <span>{t("skills.backendItems")}</span>
          </li>
          <li className="flex flex-wrap gap-1">
            <span className="font-medium text-foreground">
              {t("skills.quality")}
            </span>
            <span>{t("skills.qualityItems")}</span>
          </li>
        </ul>
      </PageSection>

      <PageSection title={t("experienceTitle")}>
        <ul className="space-y-4">
          <li>
            <span className="font-medium text-foreground">
              {t("experience.napierTitle")}
            </span>
            <div className="text-muted-foreground">
              {t("experience.napierDescription")}
            </div>
          </li>
          <li>
            <span className="font-medium text-foreground">
              {t("experience.salonTitle")}
            </span>
            <div className="text-muted-foreground">
              {t("experience.salonDescription")}
            </div>
          </li>
          <li>
            <span className="font-medium text-foreground">
              {t("experience.softbankResearchTitle")}
            </span>
            <div className="text-muted-foreground">
              {t("experience.softbankResearchDescription")}
            </div>
          </li>
          <li>
            <span className="font-medium text-foreground">
              {t("experience.softbankPmTitle")}
            </span>
            <div className="text-muted-foreground">
              {t("experience.softbankPmDescription")}
            </div>
          </li>
        </ul>
      </PageSection>

      <PageSection title={t("educationTitle")}>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li>{t("education.tokyo")}</li>
          <li>{t("education.rikkyo")}</li>
        </ul>
      </PageSection>

      <PageSection title={t("linksTitle")}>
        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          <li className="flex flex-wrap items-center gap-1">
            <span>{t("links.github")}</span>
            <Button asChild className="h-auto p-0" variant="link">
              <a
                href="https://github.com/o3osatoshi"
                rel="noreferrer"
                target="_blank"
              >
                @o3osatoshi
              </a>
            </Button>
          </li>
          <li className="flex flex-wrap items-center gap-1">
            <span>{t("links.blog")}</span>
            <Button asChild className="h-auto p-0" variant="link">
              <a
                href="https://o3osatoshi.github.io"
                rel="noreferrer"
                target="_blank"
              >
                o3osatoshi.github.io
              </a>
            </Button>
          </li>
          <li className="flex flex-wrap items-center gap-1">
            <span>{t("links.linkedin")}</span>
            <Button asChild className="h-auto p-0" variant="link">
              <a
                href="https://www.linkedin.com/in/satoshi-ogura-189479135/"
                rel="noreferrer"
                target="_blank"
              >
                Satoshi Ogura
              </a>
            </Button>
          </li>
          <li className="flex flex-wrap items-center gap-1">
            <span>{t("links.x")}</span>
            <Button asChild className="h-auto p-0" variant="link">
              <a
                href="https://x.com/o3osatoshi"
                rel="noreferrer"
                target="_blank"
              >
                @o3osatoshi
              </a>
            </Button>
          </li>
        </ul>
      </PageSection>
    </>
  );
}
