import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

describe("Sheet", () => {
  it("opens from the configured side and renders slots", async () => {
    const user = userEvent.setup();

    render(
      <Sheet>
        <SheetTrigger>Open sheet</SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>
              Choose what you want to be notified about.
            </SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <button type="button">Done</button>
          </SheetFooter>
          <SheetClose>Cancel</SheetClose>
        </SheetContent>
      </Sheet>,
    );

    await user.click(screen.getByRole("button", { name: "Open sheet" }));

    const title = await screen.findByText("Notifications");
    expect(title).toHaveAttribute("data-slot", "sheet-title");
    expect(
      screen.getByText("Choose what you want to be notified about."),
    ).toHaveAttribute("data-slot", "sheet-description");

    const content = title.closest("div[data-slot='sheet-content']");
    expect(content).not.toBeNull();
    expect(content?.className).toContain("slide-in-from-left");
    expect(
      document.querySelector('[data-slot="sheet-overlay"]'),
    ).not.toBeNull();
    expect(screen.getByRole("button", { name: "Cancel" })).toHaveAttribute(
      "data-slot",
      "sheet-close",
    );

    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => {
      expect(screen.queryByText("Notifications")).not.toBeInTheDocument();
    });
  });
});
