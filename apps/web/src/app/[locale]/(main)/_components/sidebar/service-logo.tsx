import { getTranslations } from "next-intl/server";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@o3osatoshi/ui/client";

import SidebarLink from "./sidebar-link";

interface Props {
  locale: string;
}

export default async function ServiceLogo({ locale }: Props) {
  const t = await getTranslations({ namespace: "Brand", locale });

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild size="lg">
          <SidebarLink href="/">
            <span className="truncate font-code text-xl leading-tight md:text-2xl">
              {t("name")}
            </span>
          </SidebarLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
