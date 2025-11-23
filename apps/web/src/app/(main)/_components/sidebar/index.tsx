import ServiceLogo from "@/app/(main)/_components/sidebar/service-logo";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  Sidebar as UiSidebar,
} from "@o3osatoshi/ui/client";

import Navigation from "./navigation";
import Setting from "./setting";
import User from "./user";

export default function Sidebar() {
  return (
    <UiSidebar variant="inset">
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
