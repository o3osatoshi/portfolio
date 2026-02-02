import ServiceLogo from "@/app/[locale]/(main)/_components/sidebar/service-logo";
import {
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  Sidebar as UiSidebar,
} from "@o3osatoshi/ui/client";

import Navigation from "./navigation";
import Setting from "./setting";
import User from "./user";

interface Props {
  locale: string;
}

export default function Sidebar({ locale }: Props) {
  return (
    <UiSidebar variant="inset">
      <SidebarHeader>
        <ServiceLogo locale={locale} />
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
