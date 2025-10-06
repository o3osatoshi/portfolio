import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FormInput } from "./form-input";

describe("FormInput", () => {
  it("associates the label with the underlying input and shows errors", () => {
    const { unmount } = render(
      <FormInput
        id="email"
        errorMessage="Required field"
        label="Email"
        placeholder="you@example.com"
      />,
    );

    const label = screen.getByText("Email");
    const input = screen.getByLabelText("Email");

    expect(label).toHaveAttribute("for", "email");
    expect(input).toHaveAttribute("id", "email");
    expect(screen.getByText("Required field")).toHaveAttribute(
      "data-slot",
      "alert-title",
    );

    unmount();
  });

  it("omits the message when no error is supplied", () => {
    render(<FormInput id="name" label="Name" />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
