import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import TextBlock from "@/app/[locale]/(main)/_components/text-block";
import { Button } from "@o3osatoshi/ui";

interface Props {
  params: Promise<{ locale: string }>;
}

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

export default async function Page({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "ToolkitIndex", locale });

  const ossItems = [
    {
      name: t("sections.oss.items.logging.name"),
      description: t("sections.oss.items.logging.description"),
      url: t("sections.oss.items.logging.url"),
    },
    {
      name: t("sections.oss.items.ui.name"),
      description: t("sections.oss.items.ui.description"),
      url: t("sections.oss.items.ui.url"),
    },
    {
      name: t("sections.oss.items.toolkit.name"),
      description: t("sections.oss.items.toolkit.description"),
      url: t("sections.oss.items.toolkit.url"),
    },
    {
      name: t("sections.oss.items.config.name"),
      description: t("sections.oss.items.config.description"),
      url: t("sections.oss.items.config.url"),
    },
  ];

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      <PageSection>
        <TextBlock>
          <p>{t("sections.summary.paragraphs.first")}</p>
          <p>{t("sections.summary.paragraphs.second")}</p>
        </TextBlock>
      </PageSection>

      <PageSection title={t("sections.oss.title")}>
        <TextBlock>
          <ul className="space-y-3">
            {ossItems.map((item) => (
              <li key={item.name} className="space-y-1">
                <Button asChild className="h-auto p-0" variant="link">
                  <a href={item.url} rel="noreferrer" target="_blank">
                    {item.name}
                  </a>
                </Button>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
          <p>{t("sections.oss.note")}</p>
        </TextBlock>
      </PageSection>
    </>
  );
}
