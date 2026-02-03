import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { getTranslations } from "next-intl/server";

import PageHeader from "@/app/[locale]/(main)/_components/page-header";
import PageSection from "@/app/[locale]/(main)/_components/page-section";
import TextBlock from "@/app/[locale]/(main)/_components/text-block";
import { Button } from "@o3osatoshi/ui";

type LinkItem = {
  description: string;
  name: string;
  url: string;
};

interface Props {
  params: Promise<{ locale: string }>;
}

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

export default async function Page({ params }: Props) {
  "use cache";
  cacheLife("staticPage");
  const { locale } = await params;
  const t = await getTranslations({ namespace: "PortfolioLinks", locale });
  const actionLabel = t("actions.visit");
  const socialLinks: LinkItem[] = [
    {
      name: t("sections.social.items.linkedin.name"),
      description: t("sections.social.items.linkedin.description"),
      url: t("sections.social.items.linkedin.url"),
    },
    {
      name: t("sections.social.items.youtrust.name"),
      description: t("sections.social.items.youtrust.description"),
      url: t("sections.social.items.youtrust.url"),
    },
    {
      name: t("sections.social.items.github.name"),
      description: t("sections.social.items.github.description"),
      url: t("sections.social.items.github.url"),
    },
    {
      name: t("sections.social.items.x.name"),
      description: t("sections.social.items.x.description"),
      url: t("sections.social.items.x.url"),
    },
  ];
  const siteLinks: LinkItem[] = [
    {
      name: t("sections.sites.items.blog.name"),
      description: t("sections.sites.items.blog.description"),
      url: t("sections.sites.items.blog.url"),
    },
    {
      name: t("sections.sites.items.ui.name"),
      description: t("sections.sites.items.ui.description"),
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
          <ul className="space-y-4">
            {socialLinks.map((item) => (
              <li
                key={item.name}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
                <Button
                  asChild
                  className="h-auto gap-2 self-start sm:self-auto"
                  variant="outline"
                >
                  <a href={item.url} rel="noreferrer" target="_blank">
                    {actionLabel}
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </TextBlock>
      </PageSection>

      <PageSection title={t("sections.sites.title")}>
        <TextBlock>
          <ul className="space-y-4">
            {siteLinks.map((item) => (
              <li
                key={item.name}
                className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>
                <Button
                  asChild
                  className="h-auto gap-2 self-start sm:self-auto"
                  variant="outline"
                >
                  <a href={item.url} rel="noreferrer" target="_blank">
                    {actionLabel}
                    <ExternalLink className="size-4" />
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
