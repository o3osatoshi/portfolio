import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Separator } from "./separator";

describe("Separator", () => {
  it("renders a decorative horizontal separator by default", () => {
    const { container } = render(<Separator />);

    const separator = container.querySelector('[data-slot="separator-root"]');

    expect(separator).not.toBeNull();
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
  });

  it("can render an accessible vertical separator", () => {
    const { getByRole } = render(
      <Separator decorative={false} orientation="vertical" />,
    );

    const separator = getByRole("separator");

    expect(separator).toHaveAttribute("data-orientation", "vertical");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });
});
