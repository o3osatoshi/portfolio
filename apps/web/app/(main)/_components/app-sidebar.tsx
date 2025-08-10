import { Atom, FlaskConical, Layers } from "lucide-react";
import type * as React from "react";

import { NavMain } from "@/app/(main)/_components/nav-main";
import { NavProjects } from "@/app/(main)/_components/nav-projects";
import { NavSecondary } from "@/app/(main)/_components/nav-secondary";
import { NavUser } from "@/app/(main)/_components/nav-user";
import { getLabel, getPathName } from "@/utils/handle-nav";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@repo/ui/components/sidebar";

const data = {
  navMain: [
    {
      title: getLabel("core"),
      url: "#",
      icon: Atom,
      isActive: true,
      items: [
        {
          title: getLabel("core-server-crud"),
          url: getPathName("core-server-crud"),
        },
        {
          title: getLabel("core-limited"),
          url: getPathName("core-limited"),
        },
      ],
    },
    {
      title: getLabel("web3"),
      url: "#",
      icon: Layers,
      isActive: true,
      items: [
        {
          title: getLabel("web3-crud"),
          url: getPathName("web3-crud"),
        },
      ],
    },
  ],
  navSecondary: [],
  projects: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <FlaskConical className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">o3osatoshi</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
