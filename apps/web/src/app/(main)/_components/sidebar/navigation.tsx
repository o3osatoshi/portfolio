import {
  ChevronRight,
  Construction,
  FlaskConical,
  type LucideIcon,
  User,
} from "lucide-react";

import { getLabel, getPathName } from "@/utils/handle-nav";
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

type NavMain = {
  icon: LucideIcon;
  isActive?: boolean;
  items?: {
    isWIP?: boolean;
    title: string;
    url: string;
  }[];
  title: string;
  url: string;
}[];

const data: { navMain: NavMain } = {
  navMain: [
    {
      icon: User,
      isActive: true,
      items: [
        {
          title: getLabel("portfolio-about"),
          url: getPathName("portfolio-about"),
        },
        {
          title: getLabel("portfolio-blog"),
          url: getPathName("portfolio-blog"),
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
          url: getPathName("labs-server-crud"),
        },
        {
          title: getLabel("labs-limited-read"),
          url: getPathName("labs-limited-read"),
        },
        {
          isWIP: true,
          title: getLabel("labs-web3-crud"),
          url: getPathName("labs-web3-crud"),
        },
      ],
      title: getLabel("labs"),
      url: "#",
    },
  ],
};

export function Navigation() {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {data.navMain.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive === true}
          >
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuAction className="data-[state=open]:rotate-90">
                      <ChevronRight />
                      <span className="sr-only">Toggle</span>
                    </SidebarMenuAction>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
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
