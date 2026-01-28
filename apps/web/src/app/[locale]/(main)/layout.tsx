import type { ReactNode } from "react";

import BreadcrumbHeader from "@/app/[locale]/(main)/_components/breadcrumb-header";
import PageMain from "@/app/[locale]/(main)/_components/page-main";
import Sidebar from "@/app/[locale]/(main)/_components/sidebar";
import { SidebarInset, SidebarProvider } from "@o3osatoshi/ui/client";

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <BreadcrumbHeader />
        <PageMain>{children}</PageMain>
      </SidebarInset>
    </SidebarProvider>
  );
}
