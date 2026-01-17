import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import { Button } from "@o3osatoshi/ui";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "PortfolioBlog", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("PortfolioBlog");

  return (
    <>
      <PageHeader
        actions={
          <Button asChild variant="outline">
            <Link
              href="https://o3osatoshi.github.io"
              rel="noreferrer"
              target="_blank"
            >
              {t("visitBlog")}
            </Link>
          </Button>
        }
        description={t("intro")}
        title={t("title")}
      />
      {/* Optional: fetch and render latest 3–5 posts via RSS on the server */}
    </>
  );
}
