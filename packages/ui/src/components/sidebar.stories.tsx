import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "@storybook/test";
import {
  BarChart4,
  FolderKanban,
  LayoutDashboard,
  Plus,
  Rocket,
  Settings2,
  Star,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "./sidebar";

const meta = {
  component: Sidebar,
  title: "UI/Sidebar",
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    const triggers = await body.findAllByRole("button", {
      name: /toggle sidebar/i,
    });
    const trigger = triggers.find(
      (element) => element.getAttribute("data-slot") === "sidebar-trigger",
    );

    if (!trigger) {
      throw new Error("Sidebar trigger button not found");
    }

    expect(trigger).toBeVisible();
    expect(canvas.getByPlaceholderText("Search projects")).toBeEnabled();
    expect(
      canvas.getByRole("heading", { name: "Overview", level: 1 }),
    ).toBeVisible();
  },
  render: () => (
    <SidebarProvider defaultOpen>
      <div className="flex min-h-[32rem] w-full gap-6 bg-muted/30 p-6">
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive size="lg" tooltip="Launchpad">
                  <Rocket className="size-4" />
                  <span className="font-semibold">Launchpad</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>
                Workspace
                <SidebarGroupAction aria-label="Add project">
                  <Plus className="size-4" />
                </SidebarGroupAction>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive tooltip="Overview">
                      <LayoutDashboard className="size-4" />
                      Overview
                    </SidebarMenuButton>
                    <SidebarMenuBadge>12</SidebarMenuBadge>
                    <SidebarMenuAction aria-label="Pin" showOnHover>
                      <Star className="size-4" />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Boards" variant="outline">
                      <FolderKanban className="size-4" />
                      Boards
                    </SidebarMenuButton>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton isActive>
                          Quarterly roadmap
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton>
                          Design review
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton size="sm">
                          Team updates
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuSkeleton showIcon />
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Reports</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Analytics">
                      <BarChart4 className="size-4" />
                      Analytics
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Settings">
                      <Settings2 className="size-4" />
                      Settings
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="sm" tooltip="Switch workspace">
                  <span className="inline-flex flex-col">
                    <span className="font-semibold text-sm">o3osatoshi</span>
                    <span className="text-muted-foreground text-xs">
                      Founder
                    </span>
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarSeparator />
            <SidebarInput placeholder="Search projects" />
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="flex-1 rounded-lg border bg-background p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-semibold text-2xl">Overview</h1>
              <p className="text-muted-foreground">
                Quick snapshot of traffic, conversions, and revenue trends.
              </p>
            </div>
            <SidebarTrigger variant="outline">Toggle sidebar</SidebarTrigger>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h2 className="font-medium text-sm">Weekly reach</h2>
              <p className="mt-2 font-semibold text-2xl">24,320</p>
            </div>
            <div className="rounded-lg border p-4">
              <h2 className="font-medium text-sm">Conversion rate</h2>
              <p className="mt-2 font-semibold text-2xl">4.7%</p>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  ),
};
