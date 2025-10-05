import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AmountInput } from "./amount-input";

describe("AmountInput", () => {
  it("renders a number input with scroll prevention", () => {
    render(<AmountInput />);

    const input = screen.getByPlaceholderText("0.00");

    input.focus();
    expect(document.activeElement).toBe(input);

    fireEvent.wheel(input);

    expect(document.activeElement).not.toBe(input);
    expect(input).toHaveAttribute("type", "number");
  });

  it("accepts overrides for type and disabled state", () => {
    render(<AmountInput disabled placeholder="Amount" type="text" />);

    const input = screen.getByPlaceholderText("Amount");

    expect(input).toBeDisabled();
    expect(input).toHaveAttribute("type", "text");
  });
});
