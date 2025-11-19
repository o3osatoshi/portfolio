import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@o3osatoshi/ui/client";

import SidebarLink from "./sidebar-link";

export default function ServiceLogo() {
  return (
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
  );
}
