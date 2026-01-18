import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import { Link } from "@/i18n/navigation";
import { getPath } from "@/utils/nav-handler";
import { Button } from "@o3osatoshi/ui";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "Portfolio", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("Portfolio");

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      <PageSection
        description={t("sections.pages.description")}
        title={t("sections.pages.title")}
      >
        <ul className="space-y-3">
          <li className="space-y-1">
            <Button asChild className="h-auto p-0" variant="link">
              <Link href={getPath("portfolio-about")}>
                {t("sections.pages.items.about.title")}
              </Link>
            </Button>
            <p className="text-muted-foreground text-sm">
              {t("sections.pages.items.about.description")}
            </p>
          </li>
          <li className="space-y-1">
            <Button asChild className="h-auto p-0" variant="link">
              <Link href={getPath("portfolio-blog")}>
                {t("sections.pages.items.blog.title")}
              </Link>
            </Button>
            <p className="text-muted-foreground text-sm">
              {t("sections.pages.items.blog.description")}
            </p>
          </li>
        </ul>
      </PageSection>

      <PageSection
        description={t("sections.sites.description")}
        title={t("sections.sites.title")}
      >
        <ul className="space-y-3">
          <li className="space-y-1">
            <Button asChild className="h-auto p-0" variant="link">
              <a
                href="https://blog.o3osatoshi.engr.work"
                rel="noreferrer"
                target="_blank"
              >
                {t("sections.sites.items.blog.label")}
              </a>
            </Button>
            <p className="text-muted-foreground text-sm">
              {t("sections.sites.items.blog.description")}
            </p>
          </li>
          <li className="space-y-1">
            <Button asChild className="h-auto p-0" variant="link">
              <a
                href="https://ui.o3osatoshi.engr.work"
                rel="noreferrer"
                target="_blank"
              >
                {t("sections.sites.items.ui.label")}
              </a>
            </Button>
            <p className="text-muted-foreground text-sm">
              {t("sections.sites.items.ui.description")}
            </p>
          </li>
        </ul>
      </PageSection>

      <PageSection
        description={t("sections.socials.description")}
        title={t("sections.socials.title")}
      >
        <ul className="flex flex-wrap gap-2">
          <li>
            <Button asChild className="h-auto p-0" variant="link">
              <a
                href="https://www.linkedin.com/in/satoshi-ogura-189479135"
                rel="noreferrer"
                target="_blank"
              >
                {t("sections.socials.items.linkedin.label")}
              </a>
            </Button>
          </li>
          <li>
            <Button asChild className="h-auto p-0" variant="link">
              <a
                href="https://x.com/o3osatoshi"
                rel="noreferrer"
                target="_blank"
              >
                {t("sections.socials.items.x.label")}
              </a>
            </Button>
          </li>
          <li>
            <Button asChild className="h-auto p-0" variant="link">
              <a
                href="https://github.com/o3osatoshi"
                rel="noreferrer"
                target="_blank"
              >
                {t("sections.socials.items.github.label")}
              </a>
            </Button>
          </li>
          <li>
            <Button asChild className="h-auto p-0" variant="link">
              <a
                href="https://youtrust.jp/users/c2186226cda82bbea6bff600ab9e471c"
                rel="noreferrer"
                target="_blank"
              >
                {t("sections.socials.items.youtrust.label")}
              </a>
            </Button>
          </li>
        </ul>
      </PageSection>
    </>
  );
}
