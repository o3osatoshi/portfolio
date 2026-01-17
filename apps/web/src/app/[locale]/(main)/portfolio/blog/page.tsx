import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

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
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-10">
      <h1 className="font-bold text-3xl">{t("title")}</h1>
      <p className="text-neutral-600">{t("intro")}</p>
      <div>
        <Link
          href="https://o3osatoshi.github.io"
          className="inline-block rounded border px-4 py-2 underline"
          target="_blank"
        >
          {t("visitBlog")}
        </Link>
      </div>
      {/* Optional: fetch and render latest 3–5 posts via RSS on the server */}
    </div>
  );
}
