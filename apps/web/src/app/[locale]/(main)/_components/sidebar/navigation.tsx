"use client";

import {
  ChevronRight,
  Construction,
  FlaskConical,
  type LucideIcon,
  PocketKnife,
  User,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { getPath } from "@/utils/nav-handler";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@o3osatoshi/ui/client";

import SidebarLink from "./sidebar-link";

type NavigateOption = {
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    isWIP?: boolean;
    titleKey: string;
    url: string;
  }[];
  titleKey: string;
  url: string;
};

const navigateOptions: NavigateOption[] = [
  {
    icon: User,
    isActive: true,
    items: [
      {
        titleKey: "portfolio-about",
        url: getPath("portfolio-about"),
      },
      {
        titleKey: "portfolio-experiences",
        url: getPath("portfolio-experiences"),
      },
      {
        titleKey: "portfolio-skills",
        url: getPath("portfolio-skills"),
      },
      {
        titleKey: "portfolio-education",
        url: getPath("portfolio-education"),
      },
      {
        titleKey: "portfolio-links",
        url: getPath("portfolio-links"),
      },
    ],
    titleKey: "portfolio",
    url: getPath("portfolio"),
  },
  {
    icon: FlaskConical,
    isActive: true,
    items: [
      {
        titleKey: "labs-server-actions-crud",
        url: getPath("labs-server-actions-crud"),
      },
      {
        titleKey: "labs-edge-redis-cache",
        url: getPath("labs-edge-redis-cache"),
      },
      {
        isWIP: true,
        titleKey: "labs-web3-crud",
        url: getPath("labs-web3-crud"),
      },
    ],
    titleKey: "labs",
    url: getPath("labs"),
  },
  {
    icon: PocketKnife,
    isActive: true,
    items: [
      {
        titleKey: "toolkit-abortable-sleep",
        url: getPath("toolkit-abortable-sleep"),
      },
    ],
    titleKey: "toolkit",
    url: getPath("toolkit"),
  },
];

export default function Navigation() {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");

  return (
    <SidebarGroup>
      <SidebarMenu>
        {navigateOptions.map((opt) => (
          <Collapsible
            key={opt.titleKey}
            asChild
            defaultOpen={opt.isActive === true}
          >
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t(opt.titleKey)}>
                <SidebarLink href={opt.url}>
                  <opt.icon />
                  <span>{t(opt.titleKey)}</span>
                </SidebarLink>
              </SidebarMenuButton>
              {opt.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">{tCommon("toggle")}</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {opt.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.titleKey}>
                          {subItem.isWIP ? (
                            <SidebarMenuSubButton aria-disabled="true">
                              <Construction />
                              <span>{t(subItem.titleKey)}</span>
                            </SidebarMenuSubButton>
                          ) : (
                            <SidebarMenuSubButton asChild>
                              <SidebarLink href={subItem.url}>
                                <span>{t(subItem.titleKey)}</span>
                              </SidebarLink>
                            </SidebarMenuSubButton>
                          )}
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : null}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
