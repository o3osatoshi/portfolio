import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import TextBlock from "@/app/[locale]/(main)/_components/text-block";
import { Button } from "@o3osatoshi/ui";

type LinkItem = {
  name: string;
  url: string;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ namespace: "PortfolioLinks", locale });

  return {
    description: t("metadata.description"),
    title: t("metadata.title"),
  };
}

export default async function Page() {
  const t = await getTranslations("PortfolioLinks");
  const socialLinks: LinkItem[] = [
    {
      name: t("sections.social.items.linkedin.name"),
      url: t("sections.social.items.linkedin.url"),
    },
    {
      name: t("sections.social.items.x.name"),
      url: t("sections.social.items.x.url"),
    },
    {
      name: t("sections.social.items.youtrust.name"),
      url: t("sections.social.items.youtrust.url"),
    },
    {
      name: t("sections.social.items.github.name"),
      url: t("sections.social.items.github.url"),
    },
  ];
  const siteLinks: LinkItem[] = [
    {
      name: t("sections.sites.items.blog.name"),
      url: t("sections.sites.items.blog.url"),
    },
    {
      name: t("sections.sites.items.ui.name"),
      url: t("sections.sites.items.ui.url"),
    },
  ];

  return (
    <>
      <PageHeader
        description={t("header.description")}
        title={t("header.title")}
      />

      <PageSection title={t("sections.social.title")}>
        <TextBlock>
          <ul className="space-y-3">
            {socialLinks.map((item) => (
              <li key={item.name} className="space-y-1">
                <p className="font-medium text-foreground">{item.name}</p>
                <Button asChild className="h-auto p-0" variant="link">
                  <a href={item.url} rel="noreferrer" target="_blank">
                    {item.url}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </TextBlock>
      </PageSection>

      <PageSection title={t("sections.sites.title")}>
        <TextBlock>
          <ul className="space-y-3">
            {siteLinks.map((item) => (
              <li key={item.name} className="space-y-1">
                <p className="font-medium text-foreground">{item.name}</p>
                <Button asChild className="h-auto p-0" variant="link">
                  <a href={item.url} rel="noreferrer" target="_blank">
                    {item.url}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </TextBlock>
      </PageSection>
    </>
  );
}
