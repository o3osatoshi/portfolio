import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

describe("DropdownMenu", () => {
  it("renders menu structure with slots when opened", async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel inset>Actions</DropdownMenuLabel>
          <DropdownMenuItem inset>New File</DropdownMenuItem>
          <DropdownMenuCheckboxItem checked>Autosave</DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger inset>Share</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>
                Copy link
                <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Open menu" }));

    await waitFor(() => {
      expect(
        document.querySelector('[data-slot="dropdown-menu-content"]'),
      ).not.toBeNull();
    });

    expect(screen.getByText("Actions")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-label",
    );
    expect(screen.getByRole("menuitem", { name: "New File" })).toHaveAttribute(
      "data-slot",
      "dropdown-menu-item",
    );
    expect(
      screen.getByRole("menuitemcheckbox", { name: "Autosave" }),
    ).toHaveAttribute("data-slot", "dropdown-menu-checkbox-item");

    await user.hover(screen.getByText("Share"));

    await waitFor(() => {
      expect(
        screen.getByRole("menuitem", { name: /Copy link/ }),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("menuitem", { name: /Copy link/ })).toHaveAttribute(
      "data-slot",
      "dropdown-menu-item",
    );

    expect(screen.getByText("⌘K")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-shortcut",
    );
    expect(screen.getByText("Share")).toHaveAttribute(
      "data-slot",
      "dropdown-menu-sub-trigger",
    );
  });

  it("supports grouping and radio selections with the portal helper", () => {
    render(
      <DropdownMenu onOpenChange={() => {}} open>
        <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuLabel>View</DropdownMenuLabel>
              <DropdownMenuRadioGroup value="grid">
                <DropdownMenuRadioItem value="grid">
                  Grid view
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>,
    );

    const radio = screen.getByRole("menuitemradio", { name: "Grid view" });
    expect(radio).toHaveAttribute("data-slot", "dropdown-menu-radio-item");
  });
});
