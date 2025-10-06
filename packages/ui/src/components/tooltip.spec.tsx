import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

describe("Tooltip", () => {
  it("renders trigger and content through the shared provider", async () => {
    render(
      <Tooltip onOpenChange={() => {}} open>
        <TooltipTrigger asChild>
          <button type="button">Hover me</button>
        </TooltipTrigger>
        <TooltipContent sideOffset={8}>Helpful hint</TooltipContent>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "Hover me" });
    expect(trigger).toHaveAttribute("data-slot", "tooltip-trigger");

    const content = document.querySelector(
      '[data-slot="tooltip-content"]',
    ) as HTMLElement;
    expect(content).not.toBeNull();
    expect(content.textContent).toContain("Helpful hint");
  });
});
