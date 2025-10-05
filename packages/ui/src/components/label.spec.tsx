import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Label } from "./label";

describe("Label", () => {
  it("forwards props to the radix label root", () => {
    render(
      <Label className="text-emerald-500" htmlFor="email">
        Email
      </Label>,
    );

    const label = screen.getByText("Email");

    expect(label).toHaveAttribute("data-slot", "label");
    expect(label).toHaveAttribute("for", "email");
    expect(label).toHaveClass("text-emerald-500");
  });
});
