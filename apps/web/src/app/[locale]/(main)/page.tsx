import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import { Link } from "@/i18n/navigation";
import { getPath } from "@/utils/nav-handler";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@o3osatoshi/ui";

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
          <Card>
            <CardHeader>
              <CardTitle>{t("portfolioTitle")}</CardTitle>
              <CardDescription>{t("portfolioDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-6 text-muted-foreground text-sm">
                <li>{t("portfolioItems.intro")}</li>
                <li>{t("portfolioItems.blog")}</li>
                <li>{t("portfolioItems.projects")}</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={getPath("portfolio-about")}>
                  {t("portfolioLink")}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("labsTitle")}</CardTitle>
              <CardDescription>{t("labsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-6 text-muted-foreground text-sm">
                <li>{t("labsItems.crud")}</li>
                <li>{t("labsItems.web3")}</li>
                <li>{t("labsItems.latest")}</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={getPath("labs-server-crud")}>{t("labsLink")}</Link>
              </Button>
            </CardFooter>
          </Card>
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
