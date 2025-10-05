import {
  act,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/hooks", async () => {
  const actual = await vi.importActual<typeof import("@/hooks")>("@/hooks");
  return {
    ...actual,
    useIsMobile: vi.fn(),
  };
});

import { useIsMobile } from "@/hooks";

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
  useSidebar,
} from "./sidebar";

const mockedUseIsMobile = vi.mocked(useIsMobile);

/** Utility wrapper mounting a basic sidebar layout for assertions. */
function DesktopSidebarFixture() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarHeader>Header</SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupAction aria-label="Pin" />
          <SidebarGroupContent>
            <SidebarInset>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton>Dashboard</SidebarMenuButton>
                  <SidebarMenuAction aria-label="Add" />
                  <SidebarMenuBadge>5</SidebarMenuBadge>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton>Nested</SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarInset>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarInput placeholder="Search" />
        <SidebarSeparator />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

beforeEach(() => {
  mockedUseIsMobile.mockReturnValue(false);
});

describe("Sidebar", () => {
  it("toggles between expanded and collapsed states via the trigger", async () => {
    const user = userEvent.setup();

    render(
      <SidebarProvider>
        <DesktopSidebarFixture />
        <SidebarTrigger />
      </SidebarProvider>,
    );

    const sidebar = document.querySelector('[data-slot="sidebar"][data-state]');
    expect(sidebar).toHaveAttribute("data-state", "expanded");
    expect(
      document.querySelector('[data-slot="sidebar-content"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-inset"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-group-action"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-separator"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-menu-sub"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-menu-sub-item"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-menu-sub-button"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-menu-item"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-menu-action"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-menu-badge"]'),
    ).not.toBeNull();

    const trigger = document.querySelector(
      '[data-slot="sidebar-trigger"]',
    ) as HTMLButtonElement;
    expect(trigger).not.toBeNull();

    await user.click(trigger);

    await waitFor(() => {
      expect(sidebar).toHaveAttribute("data-state", "collapsed");
    });

    await user.click(trigger);

    await waitFor(() => {
      expect(sidebar).toHaveAttribute("data-state", "expanded");
    });
  });

  it("collapses and expands from the desktop rail control", async () => {
    const user = userEvent.setup();

    render(
      <SidebarProvider defaultOpen>
        <DesktopSidebarFixture />
      </SidebarProvider>,
    );

    const sidebar = document.querySelector('[data-slot="sidebar"][data-state]');
    expect(sidebar).toHaveAttribute("data-state", "expanded");

    const rail = document.querySelector(
      '[data-slot="sidebar-rail"]',
    ) as HTMLButtonElement;
    expect(rail).not.toBeNull();

    await user.click(rail);

    await waitFor(() => {
      expect(sidebar).toHaveAttribute("data-state", "collapsed");
    });
  });

  it("exposes mobile-specific state via the sidebar provider", () => {
    mockedUseIsMobile.mockReturnValue(true);

    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <SidebarProvider>{children}</SidebarProvider>
    );

    const { result } = renderHook(() => useSidebar(), { wrapper });

    expect(result.current.isMobile).toBe(true);
    expect(result.current.openMobile).toBe(false);

    act(() => {
      result.current.toggleSidebar();
    });

    expect(result.current.openMobile).toBe(true);
  });

  it("renders accessory slots for actions, badges, and skeletons", () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>Item</SidebarMenuButton>
                <SidebarMenuAction aria-label="actions" />
                <SidebarMenuBadge>2</SidebarMenuBadge>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarInput placeholder="Search" />
          </SidebarFooter>
        </Sidebar>
        <SidebarMenuSkeleton data-testid="skeleton" showIcon />
      </SidebarProvider>,
    );

    expect(
      document.querySelector('[data-slot="sidebar-menu-action"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-menu-badge"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="sidebar-input"]'),
    ).not.toBeNull();
    expect(screen.getByTestId("skeleton")).toHaveAttribute(
      "data-slot",
      "sidebar-menu-skeleton",
    );
  });

  it("throws when useSidebar is called outside of the provider", () => {
    expect(() => renderHook(() => useSidebar())).toThrowError(
      /useSidebar must be used within a SidebarProvider/,
    );
  });
});
