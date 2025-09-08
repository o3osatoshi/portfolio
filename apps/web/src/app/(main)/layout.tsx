import { AppSidebar } from "@/app/(main)/_components/app-sidebar";
import BreadcrumbHeader from "@/app/(main)/_components/breadcrumb-header";
import { SidebarInset, SidebarProvider } from "@o3osatoshi/ui/client";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbHeader />
        <div className="p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
