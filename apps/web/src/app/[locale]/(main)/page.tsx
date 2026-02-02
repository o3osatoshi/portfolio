import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import { Link } from "@/i18n/navigation";
import { getPath } from "@/utils/nav-handler";
import { Button } from "@o3osatoshi/ui";

interface Props {
  params: Promise<{ locale: string }>;
}

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

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "Home", locale });

  return (
    <>
      <PageHeader
        description={t.rich("header.description", {
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
        title={t("header.title")}
      />

      <PageSection title={t("sections.portfolio.title")}>
        <div className="space-y-2 text-muted-foreground">
          <p>{t("sections.portfolio.description")}</p>
          <p>{t("sections.portfolio.detail")}</p>
        </div>
        <div className="pt-2">
          <Button asChild className="h-auto p-0" variant="link">
            <Link href={getPath("portfolio")}>
              {t("sections.portfolio.cta")}
            </Link>
          </Button>
        </div>
      </PageSection>

      <PageSection title={t("sections.labs.title")}>
        <div className="space-y-2 text-muted-foreground">
          <p>{t("sections.labs.description")}</p>
          <p>{t("sections.labs.detail")}</p>
        </div>
        <div className="pt-2">
          <Button asChild className="h-auto p-0" variant="link">
            <Link href={getPath("labs")}>{t("sections.labs.cta")}</Link>
          </Button>
        </div>
      </PageSection>

      <PageSection title={t("sections.toolkit.title")}>
        <div className="space-y-2 text-muted-foreground">
          <p>{t("sections.toolkit.description")}</p>
          <p>{t("sections.toolkit.detail")}</p>
        </div>
        <div className="pt-2">
          <Button asChild className="h-auto p-0" variant="link">
            <Link href={getPath("toolkit")}>{t("sections.toolkit.cta")}</Link>
          </Button>
        </div>
      </PageSection>

      <PageSection title={t("sections.sourceCode.title")}>
        <p className="text-muted-foreground">
          {t("sections.sourceCode.description")}
        </p>
        <div className="pt-2">
          <Button asChild className="h-auto p-0" variant="link">
            <a
              href="https://github.com/o3osatoshi/portfolio"
              rel="noreferrer"
              target="_blank"
            >
              {t("sections.sourceCode.cta")}
            </a>
          </Button>
        </div>
      </PageSection>
    </>
  );
}
