import { FlaskConical, User } from "lucide-react";
import type * as React from "react";

import { getLabel, getPathName } from "@/utils/handle-nav";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as UiSidebar,
} from "@o3osatoshi/ui/client";

import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import { SidebarLink } from "./sidebar-link";

const data = {
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
  navSecondary: [],
  projects: [],
};

export function Sidebar({ ...props }: React.ComponentProps<typeof UiSidebar>) {
  return (
    <UiSidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <SidebarLink href="/">
                <span className="truncate font-code text-xl leading-tight md:text-2xl">
                  o3osatoshi
                </span>
              </SidebarLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </UiSidebar>
  );
}
