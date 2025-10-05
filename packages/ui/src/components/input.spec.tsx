import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { Input } from "./input";

describe("Input", () => {
  it("renders a text input with slot attribute", () => {
    render(<Input placeholder="Email" />);

    const input = screen.getByPlaceholderText("Email");

    expect(input).toHaveAttribute("data-slot", "input");
    expect((input as HTMLInputElement).type).toBe("text");
  });

  it("forwards props and supports interactions", async () => {
    const user = userEvent.setup();

    render(<Input aria-label="Password" type="password" />);

    const field = screen.getByLabelText("Password");

    expect(field).toHaveAttribute("type", "password");

    await user.type(field, "sup3r-secret");

    expect(field).toHaveValue("sup3r-secret");
  });

  it("merges class names and respects validation state", () => {
    render(
      <Input
        aria-invalid="true"
        className="ring-2 ring-emerald-400"
        defaultValue="invalid"
      />,
    );

    const input = screen.getByDisplayValue("invalid");

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("ring-emerald-400");
  });
});
