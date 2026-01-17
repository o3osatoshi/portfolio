import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { getPath } from "@/utils/nav-handler";

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
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-bold text-3xl">{t("title")}</h1>
        <p className="mt-2 text-neutral-600">{t("intro")}</p>
      </header>

      <section className="space-y-6">
        <h2 className="font-semibold text-xl">{t("siteStructure")}</h2>

        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">{t("portfolioTitle")}</h3>
            <p className="mb-3 text-neutral-600">{t("portfolioDescription")}</p>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-neutral-600 text-sm">
              <li>{t("portfolioItems.intro")}</li>
              <li>{t("portfolioItems.blog")}</li>
              <li>{t("portfolioItems.projects")}</li>
            </ul>
            <Link
              href={getPath("portfolio-about")}
              className="inline-block rounded border px-4 py-2 underline"
            >
              {t("portfolioLink")}
            </Link>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-semibold">{t("labsTitle")}</h3>
            <p className="mb-3 text-neutral-600">{t("labsDescription")}</p>
            <ul className="mb-4 list-disc space-y-1 pl-6 text-neutral-600 text-sm">
              <li>{t("labsItems.crud")}</li>
              <li>{t("labsItems.web3")}</li>
              <li>{t("labsItems.latest")}</li>
            </ul>
            <Link
              href={getPath("labs-server-crud")}
              className="inline-block rounded border px-4 py-2 underline"
            >
              {t("labsLink")}
            </Link>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">{t("sourceCodeTitle")}</h2>
        <p className="text-neutral-600">{t("sourceCodeDescription")}</p>
        <a
          href="https://github.com/o3osatoshi/portfolio"
          className="inline-block rounded border px-4 py-2 underline"
          rel="noreferrer"
          target="_blank"
        >
          {t("sourceCodeLink")}
        </a>
      </section>
    </div>
  );
}
