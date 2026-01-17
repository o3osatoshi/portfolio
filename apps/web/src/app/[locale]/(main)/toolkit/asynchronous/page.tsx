import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import SleepDemoCard from "@/app/[locale]/(main)/toolkit/asynchronous/_components/sleep-demo";
import { Link } from "@/i18n/navigation";
import { getPath } from "@/utils/nav-handler";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "ToolkitAsynchronous", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("ToolkitAsynchronous");
  const tToolkit = await getTranslations("Toolkit");

  return (
    <>
      <PageHeader
        description={t.rich("intro", {
          sleep: (chunks) => <code>{chunks}</code>,
        })}
        title={t("title")}
      />

      <PageSection
        description={t.rich("sectionIntro", {
          infraError: (chunks) => <code>{chunks}</code>,
        })}
        title={t("sectionTitle")}
      >
        <SleepDemoCard />
      </PageSection>

      <footer className="text-neutral-600 text-sm">
        <Link href={getPath("toolkit")} className="underline">
          {tToolkit("backToIndex")}
        </Link>
      </footer>
    </>
  );
}
