import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header className="space-y-2">
        <h1 className="font-semibold text-3xl">{t("title")}</h1>
        <p className="text-neutral-600">
          {t.rich("intro", {
            sleep: (chunks) => <code>{chunks}</code>,
          })}
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">{t("sectionTitle")}</h2>
        <p className="text-neutral-600">
          {t.rich("sectionIntro", {
            infraError: (chunks) => <code>{chunks}</code>,
          })}
        </p>
        <SleepDemoCard />
      </section>

      <footer className="text-neutral-600 text-sm">
        <Link href={getPath("toolkit")} className="underline">
          {tToolkit("backToIndex")}
        </Link>
      </footer>
    </div>
  );
}
