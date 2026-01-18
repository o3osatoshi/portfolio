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
  const t = await getTranslations({ namespace: "ToolkitIndex", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("ToolkitIndex");

  return (
    <>
      <PageHeader
        description={t.rich("header.description", {
          toolkit: (chunks) => <code>{chunks}</code>,
        })}
        title={t("header.title")}
      />

      <PageSection title={t("sections.demos.title")}>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
          <li>
            <Button asChild className="h-auto p-0" variant="link">
              <Link href={getPath("toolkit-asynchronous")}>
                {t("sections.demos.items.asynchronous")}
              </Link>
            </Button>
          </li>
          <li>
            <Button asChild className="h-auto p-0" variant="link">
              <Link href={getPath("toolkit-redis-cache")}>
                {t("sections.demos.items.redisCache")}
              </Link>
            </Button>
          </li>
        </ul>
      </PageSection>
    </>
  );
}
