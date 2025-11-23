import type { ReactNode } from "react";

import BreadcrumbHeader from "@/app/(main)/_components/breadcrumb-header";
import Sidebar from "@/app/(main)/_components/sidebar";
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
        <div className="p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
