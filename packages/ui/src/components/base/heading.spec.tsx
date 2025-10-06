import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Heading } from "./heading";

describe("Heading", () => {
  it.each([
    ["h1", 1],
    ["h2", 2],
    ["h3", 3],
    ["h4", 4],
    ["h5", 5],
    ["h6", 6],
  ] as const)("renders semantic %s element", (level, ariaLevel) => {
    render(<Heading level={level}>{level.toUpperCase()} title</Heading>);

    const heading = screen.getByRole("heading", { level: ariaLevel });

    expect(heading).toHaveAttribute("data-slot", "heading");
    expect(heading.tagName.toLowerCase()).toBe(level);
  });

  it("applies alignment classes and merges custom className", () => {
    render(
      <Heading align="center" className="text-purple-500">
        Centered
      </Heading>,
    );

    const heading = screen.getByRole("heading", { name: "Centered" });

    expect(heading).toHaveClass("text-center");
    expect(heading).toHaveClass("text-purple-500");
  });
});
