"use client";

import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import type * as React from "react";

import { NavMain } from "@/app/(signed)/_components/nav-main";
import { NavProjects } from "@/app/(signed)/_components/nav-projects";
import { NavSecondary } from "@/app/(signed)/_components/nav-secondary";
import { NavUser } from "@/app/(signed)/_components/nav-user";
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
      title: "Core",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "CRUD",
          url: "/core/crud",
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
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
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
