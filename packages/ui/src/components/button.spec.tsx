import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
  it("renders children text and exposes the button role", () => {
    render(<Button>Save changes</Button>);

    const button = screen.getByRole("button", { name: "Save changes" });

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("data-slot", "button");
  });

  it("calls onClick when the button is activated", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole("button", { name: "Click me" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not fire onClick while disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <Button disabled onClick={handleClick}>
        Submit
      </Button>,
    );

    await user.click(screen.getByRole("button", { name: "Submit" }));

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("applies CVA classes for variant, size, and merges className", () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>);

    let button = screen.getByRole("button", { name: "Delete" });
    expect(button).toHaveClass("bg-destructive");

    rerender(
      <Button aria-label="Edit" className="bg-emerald-500" size="icon">
        <svg aria-hidden="true" />
      </Button>,
    );

    button = screen.getByRole("button", { name: "Edit" });
    expect(button).toHaveClass("bg-emerald-500");
    expect(button).toHaveClass("size-9");
  });

  it("supports rendering as child elements while keeping styles", () => {
    render(
      <Button asChild>
        <a href="/docs">Documentation</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Documentation" });

    expect(link).toHaveAttribute("href", "/docs");
    expect(link).toHaveAttribute("data-slot", "button");
    expect(link.className).toContain("inline-flex");
  });
});
