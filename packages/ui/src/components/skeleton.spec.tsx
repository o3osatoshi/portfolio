import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders with pulse animation and data slot", () => {
    const { container } = render(<Skeleton className="h-6" />);

    const skeleton = container.querySelector('[data-slot="skeleton"]');

    expect(skeleton).not.toBeNull();
    expect(skeleton).toHaveClass("animate-pulse");
    expect(skeleton).toHaveClass("h-6");
  });
});
