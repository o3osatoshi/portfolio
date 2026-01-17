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
  const t = await getTranslations({ namespace: "Home", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("Home");

  return (
    <>
      <PageHeader description={t("intro")} title={t("title")} />

      <PageSection title={t("siteStructure")}>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">{t("portfolioTitle")}</h3>
            <p className="mb-3 text-neutral-600">{t("portfolioDescription")}</p>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-neutral-600 text-sm">
              <li>{t("portfolioItems.intro")}</li>
              <li>{t("portfolioItems.blog")}</li>
              <li>{t("portfolioItems.projects")}</li>
            </ul>
            <Button asChild variant="outline">
              <Link href={getPath("portfolio-about")}>
                {t("portfolioLink")}
              </Link>
            </Button>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">{t("labsTitle")}</h3>
            <p className="mb-3 text-neutral-600">{t("labsDescription")}</p>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-neutral-600 text-sm">
              <li>{t("labsItems.crud")}</li>
              <li>{t("labsItems.web3")}</li>
              <li>{t("labsItems.latest")}</li>
            </ul>
            <Button asChild variant="outline">
              <Link href={getPath("labs-server-crud")}>{t("labsLink")}</Link>
            </Button>
          </div>
        </div>
      </PageSection>

      <PageSection
        description={t("sourceCodeDescription")}
        title={t("sourceCodeTitle")}
      >
        <Button asChild variant="outline">
          <a
            href="https://github.com/o3osatoshi/portfolio"
            rel="noreferrer"
            target="_blank"
          >
            {t("sourceCodeLink")}
          </a>
        </Button>
      </PageSection>
    </>
  );
}
