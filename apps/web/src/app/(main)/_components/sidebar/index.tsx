import type * as React from "react";

import { ServiceLogo } from "@/app/(main)/_components/sidebar/service-logo";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  Sidebar as UiSidebar,
} from "@o3osatoshi/ui/client";

import { Navigation } from "./navigation";
import { Setting } from "./setting";
import { User } from "./user";

export function Sidebar({ ...props }: React.ComponentProps<typeof UiSidebar>) {
  return (
    <UiSidebar variant="inset" {...props}>
      <SidebarHeader>
        <ServiceLogo />
      </SidebarHeader>
      <SidebarContent className="justify-between">
        <Navigation />
        <Setting />
      </SidebarContent>
      <SidebarFooter>
        <User />
      </SidebarFooter>
    </UiSidebar>
  );
}
