import { FlaskConical } from "lucide-react";
import * as React from "react";
import { NavMain } from "@/app/(signedin)/_components/sidebar/nav-main";
import { NavSecondary } from "@/app/(signedin)/_components/sidebar/nav-secondary";
import { NavUser } from "@/app/(signedin)/_components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export async function SidebarNav({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  // avoid dynamic functions in layouts — they make all routes dynamic
  // const session = await auth();
  //
  // with auth()
  // Route (app)                                 Size  First Load JS
  // ┌ ○ /                                      139 B         101 kB
  // ├ ○ /_not-found                            975 B         101 kB
  // ├ ƒ /api/auth/[...nextauth]                139 B         101 kB
  // └ ○ /posts                               3.23 kB         124 kB
  //
  // without auth()
  // Route (app)                                 Size  First Load JS
  // ┌ ƒ /                                      139 B         101 kB
  // ├ ƒ /_not-found                            975 B         101 kB
  // ├ ƒ /api/auth/[...nextauth]                139 B         101 kB
  // └ ƒ /posts                               3.23 kB         124 kB

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <a href="http://localhost:3000">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <FlaskConical className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">engr</span>
                  <span className="truncate text-xs">experiment</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <NavSecondary className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
