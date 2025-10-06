import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

describe("Collapsible", () => {
  it("toggles the open state when interacting with the trigger", async () => {
    const user = userEvent.setup();

    render(
      <Collapsible>
        <CollapsibleTrigger>Toggle details</CollapsibleTrigger>
        <CollapsibleContent>
          <p>Hidden content</p>
        </CollapsibleContent>
      </Collapsible>,
    );

    const trigger = screen.getByRole("button", { name: "Toggle details" });
    const content = document.querySelector(
      '[data-slot="collapsible-content"]',
    ) as HTMLElement;

    expect(trigger).toHaveAttribute("data-slot", "collapsible-trigger");
    expect(content).toHaveAttribute("data-slot", "collapsible-content");
    expect(content).toHaveAttribute("data-state", "closed");

    await user.click(trigger);

    expect(content).toHaveAttribute("data-state", "open");
  });
});
