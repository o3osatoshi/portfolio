import type { ReactNode } from "react";

import BreadcrumbHeader from "@/app/[locale]/(main)/_components/breadcrumb-header";
import PageMain from "@/app/[locale]/(main)/_components/page-main";
import Sidebar from "@/app/[locale]/(main)/_components/sidebar";
import { SidebarInset, SidebarProvider } from "@o3osatoshi/ui/client";

interface Props {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function Layout({ children, params }: Props) {
  const { locale } = await params;

  return (
    <SidebarProvider>
      <Sidebar locale={locale} />
      <SidebarInset>
        <BreadcrumbHeader />
        <PageMain>{children}</PageMain>
      </SidebarInset>
    </SidebarProvider>
  );
}
