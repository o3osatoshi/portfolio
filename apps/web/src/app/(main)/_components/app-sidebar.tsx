import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@o3osatoshi/ui/client";
import { FlaskConical, User } from "lucide-react";
import type * as React from "react";
import { NavMain } from "@/app/(main)/_components/nav-main";
import { NavProjects } from "@/app/(main)/_components/nav-projects";
import { NavSecondary } from "@/app/(main)/_components/nav-secondary";
import { NavUser } from "@/app/(main)/_components/nav-user";
import { SidebarLink } from "@/app/(main)/_components/sidebar-link";
import { getLabel, getPathName } from "@/utils/handle-nav";

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <SidebarLink href="/">
                <span className="truncate font-code text-xl md:text-2xl leading-tight">
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
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
