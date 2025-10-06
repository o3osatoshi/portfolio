import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

describe("Dialog", () => {
  it("opens and closes via the trigger and built-in close button", async () => {
    const user = userEvent.setup();

    render(
      <Dialog>
        <DialogTrigger>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Update your public information.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button">Save</button>
          </DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogContent>
      </Dialog>,
    );

    await user.click(screen.getByRole("button", { name: "Open dialog" }));

    expect(
      screen.getByRole("heading", { name: "Edit profile" }),
    ).toHaveAttribute("data-slot", "dialog-title");
    expect(screen.getByText("Update your public information.")).toHaveAttribute(
      "data-slot",
      "dialog-description",
    );
    expect(
      document.querySelector('[data-slot="dialog-overlay"]'),
    ).not.toBeNull();
    expect(
      document.querySelector('[data-slot="dialog-footer"]'),
    ).not.toBeNull();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(
        screen.queryByRole("heading", { name: "Edit profile" }),
      ).not.toBeInTheDocument();
    });
  });
});
