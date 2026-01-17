import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "PortfolioAbout", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("PortfolioAbout");

  return (
    <div className="container mx-auto max-w-3xl space-y-8 px-4 py-10">
      <header>
        <h1 className="font-bold text-3xl">{t("title")}</h1>
        <p className="mt-2 text-neutral-600">{t("intro")}</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">{t("skillsTitle")}</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>{t("skills.frontend")}</strong> {t("skills.frontendItems")}
          </li>
          <li>
            <strong>{t("skills.web3")}</strong> {t("skills.web3Items")}
          </li>
          <li>
            <strong>{t("skills.backend")}</strong> {t("skills.backendItems")}
          </li>
          <li>
            <strong>{t("skills.quality")}</strong> {t("skills.qualityItems")}
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">{t("experienceTitle")}</h2>
        <ul className="space-y-4">
          <li>
            <strong>{t("experience.napierTitle")}</strong>
            <div className="text-neutral-600">
              {t("experience.napierDescription")}
            </div>
          </li>
          <li>
            <strong>{t("experience.salonTitle")}</strong>
            <div className="text-neutral-600">
              {t("experience.salonDescription")}
            </div>
          </li>
          <li>
            <strong>{t("experience.softbankResearchTitle")}</strong>
            <div className="text-neutral-600">
              {t("experience.softbankResearchDescription")}
            </div>
          </li>
          <li>
            <strong>{t("experience.softbankPmTitle")}</strong>
            <div className="text-neutral-600">
              {t("experience.softbankPmDescription")}
            </div>
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">{t("educationTitle")}</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>{t("education.tokyo")}</li>
          <li>{t("education.rikkyo")}</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-xl">{t("linksTitle")}</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            {t("links.github")}{" "}
            <a
              href="https://github.com/o3osatoshi"
              className="underline"
              rel="noreferrer"
              target="_blank"
            >
              @o3osatoshi
            </a>
          </li>
          <li>
            {t("links.blog")}{" "}
            <a
              href="https://o3osatoshi.github.io"
              className="underline"
              rel="noreferrer"
              target="_blank"
            >
              o3osatoshi.github.io
            </a>
          </li>
          <li>
            {t("links.linkedin")}{" "}
            <a
              href="https://www.linkedin.com/in/satoshi-ogura-189479135/"
              className="underline"
              rel="noreferrer"
              target="_blank"
            >
              Satoshi Ogura
            </a>
          </li>
          <li>
            {t("links.x")}{" "}
            <a
              href="https://x.com/o3osatoshi"
              className="underline"
              rel="noreferrer"
              target="_blank"
            >
              @o3osatoshi
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}
