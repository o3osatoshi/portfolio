import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  it("renders as an accessible alert with slots", () => {
    render(
      <Alert>
        <svg role="img" aria-label="Info" />
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>This action cannot be undone.</AlertDescription>
      </Alert>,
    );

    const alert = screen.getByRole("alert");

    expect(alert).toHaveAttribute("data-slot", "alert");
    expect(screen.getByText("Heads up")).toHaveAttribute(
      "data-slot",
      "alert-title",
    );
    expect(
      screen.getByText("This action cannot be undone."),
    ).toHaveAttribute("data-slot", "alert-description");
  });

  it("applies variant styles and merges custom class names", () => {
    const { container, rerender } = render(
      <Alert variant="destructive">Something went wrong</Alert>,
    );

    const alert = container.querySelector('[role="alert"]') as HTMLElement;
    expect(alert).toHaveClass("text-destructive");

    rerender(
      <Alert className="border-dashed">Daily summary ready</Alert>,
    );

    const updated = container.querySelector('[role="alert"]') as HTMLElement;
    expect(updated).toHaveClass("border-dashed");
  });
});
