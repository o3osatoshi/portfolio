import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Message } from "./message";

describe("Message", () => {
  it("returns null when no children are provided", () => {
    const { container } = render(<Message>{undefined}</Message>);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders an alert with the provided content and variant", () => {
    render(<Message variant="destructive">Invalid email</Message>);

    const alert = screen.getByRole("alert");

    expect(alert).toHaveAttribute("data-slot", "alert");
    expect(alert.className).toContain("text-destructive");
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
  });
});
