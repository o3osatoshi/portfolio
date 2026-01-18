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
  const t = await getTranslations({ namespace: "Labs", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("Labs");

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      <PageSection
        description={t("sections.experiments.description")}
        title={t("sections.experiments.title")}
      >
        <ul className="space-y-3">
          <li className="space-y-1">
            <Button asChild className="h-auto p-0" variant="link">
              <Link href={getPath("labs-server-crud")}>
                {t("sections.experiments.items.serverCrud.title")}
              </Link>
            </Button>
            <p className="text-muted-foreground text-sm">
              {t("sections.experiments.items.serverCrud.description")}
            </p>
          </li>
          <li className="space-y-1">
            <Button asChild className="h-auto p-0" variant="link">
              <Link href={getPath("labs-web3-crud")}>
                {t("sections.experiments.items.web3Crud.title")}
              </Link>
            </Button>
            <p className="text-muted-foreground text-sm">
              {t("sections.experiments.items.web3Crud.description")}
            </p>
          </li>
        </ul>
      </PageSection>
    </>
  );
}
