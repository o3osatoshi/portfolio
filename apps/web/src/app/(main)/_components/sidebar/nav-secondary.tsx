import type { LucideIcon } from "lucide-react";
import type * as React from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@o3osatoshi/ui/client";

import { SidebarLink } from "./sidebar-link";
import { ThemeToggle } from "./theme-toggle";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    icon: LucideIcon;
    title: string;
    url: string;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild size="sm">
                <SidebarLink href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
