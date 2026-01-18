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
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      <PageSection title={t("sections.siteStructure.title")}>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("sections.siteStructure.cards.portfolio.title")}
              </CardTitle>
              <CardDescription>
                {t("sections.siteStructure.cards.portfolio.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-6 text-muted-foreground text-sm">
                <li>
                  {t("sections.siteStructure.cards.portfolio.items.intro")}
                </li>
                <li>
                  {t("sections.siteStructure.cards.portfolio.items.blog")}
                </li>
                <li>
                  {t("sections.siteStructure.cards.portfolio.items.projects")}
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={getPath("portfolio-about")}>
                  {t("sections.siteStructure.cards.portfolio.cta")}
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {t("sections.siteStructure.cards.labs.title")}
              </CardTitle>
              <CardDescription>
                {t("sections.siteStructure.cards.labs.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 pl-6 text-muted-foreground text-sm">
                <li>{t("sections.siteStructure.cards.labs.items.crud")}</li>
                <li>{t("sections.siteStructure.cards.labs.items.web3")}</li>
                <li>{t("sections.siteStructure.cards.labs.items.latest")}</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline">
                <Link href={getPath("labs-server-crud")}>
                  {t("sections.siteStructure.cards.labs.cta")}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </PageSection>

      <PageSection
        description={t("sections.sourceCode.description")}
        title={t("sections.sourceCode.title")}
      >
        <Button asChild variant="outline">
          <a
            href="https://github.com/o3osatoshi/portfolio"
            rel="noreferrer"
            target="_blank"
          >
            {t("sections.sourceCode.cta")}
          </a>
        </Button>
      </PageSection>
    </>
  );
}
