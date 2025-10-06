import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./breadcrumb";

describe("Breadcrumb", () => {
  it("wires aria attributes across the breadcrumb trail", () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <button type="button">Projects</button>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <span role="presentation">/</span>
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <BreadcrumbPage>Case Study</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>,
    );

    const nav = screen.getByLabelText("breadcrumb");
    expect(nav).toHaveAttribute("data-slot", "breadcrumb");

    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "data-slot",
      "breadcrumb-link",
    );

    const customLink = screen.getByRole("button", { name: "Projects" });
    expect(customLink).toHaveAttribute("data-slot", "breadcrumb-link");

    expect(screen.getByText("Case Study")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("renders ellipsis marker for collapsed paths", () => {
    const { container } = render(<BreadcrumbEllipsis />);

    const ellipsis = container.querySelector(
      '[data-slot="breadcrumb-ellipsis"]',
    ) as HTMLElement;

    expect(ellipsis).not.toBeNull();
    expect(ellipsis).toHaveAttribute("role", "presentation");
    expect(screen.getByText("More")).toHaveClass("sr-only");
  });
});
