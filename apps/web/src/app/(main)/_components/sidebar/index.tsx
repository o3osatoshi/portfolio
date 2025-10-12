import type * as React from "react";

import { ServiceLogo } from "@/app/(main)/_components/sidebar/service-logo";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  Sidebar as UiSidebar,
} from "@o3osatoshi/ui/client";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";

export function Sidebar({ ...props }: React.ComponentProps<typeof UiSidebar>) {
  return (
    <UiSidebar variant="inset" {...props}>
      <SidebarHeader>
        <ServiceLogo />
      </SidebarHeader>
      <SidebarContent className="justify-between">
        <NavMain />
        <NavSecondary />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </UiSidebar>
  );
}
