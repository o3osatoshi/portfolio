import { AppSidebar } from "@/app/(signed)/_components/app-sidebar";
import BreadcrumbHeader from "@/app/(signed)/_components/breadcrumb-header";
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar";

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
