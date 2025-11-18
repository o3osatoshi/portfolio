import {
  ChevronRight,
  Construction,
  FlaskConical,
  type LucideIcon,
  PocketKnife,
  User,
} from "lucide-react";

import { getLabel, getPath } from "@/utils/nav-handler";
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

import { SidebarLink } from "./sidebar-link";

type NavigateOption = {
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    isWIP?: boolean;
    title: string;
    url: string;
  }[];
  title: string;
  url: string;
};

const navigateOptions: NavigateOption[] = [
  {
    icon: User,
    isActive: true,
    items: [
      {
        title: getLabel("portfolio-about"),
        url: getPath("portfolio-about"),
      },
      {
        title: getLabel("portfolio-blog"),
        url: getPath("portfolio-blog"),
      },
    ],
    title: getLabel("portfolio"),
    url: "#",
  },
  {
    icon: FlaskConical,
    isActive: true,
    items: [
      {
        title: getLabel("labs-server-crud"),
        url: getPath("labs-server-crud"),
      },
      {
        isWIP: true,
        title: getLabel("labs-web3-crud"),
        url: getPath("labs-web3-crud"),
      },
    ],
    title: getLabel("labs"),
    url: "#",
  },
  {
    icon: PocketKnife,
    isActive: true,
    items: [
      {
        title: getLabel("toolkit-asynchronous"),
        url: getPath("toolkit-asynchronous"),
      },
    ],
    title: getLabel("toolkit"),
    url: "#",
  },
];

export function Navigation() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {navigateOptions.map((opt) => (
          <Collapsible
            key={opt.title}
            asChild
            defaultOpen={opt.isActive === true}
          >
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={opt.title}>
                <a href={opt.url}>
                  <opt.icon />
                  <span>{opt.title}</span>
                </a>
              </SidebarMenuButton>
              {opt.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {opt.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          {subItem.isWIP ? (
                            <SidebarMenuSubButton aria-disabled="true">
                              <Construction />
                              <span>{subItem.title}</span>
                            </SidebarMenuSubButton>
                          ) : (
                            <SidebarMenuSubButton asChild>
                              <SidebarLink href={subItem.url}>
                                <span>{subItem.title}</span>
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
