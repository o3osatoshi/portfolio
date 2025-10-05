import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

describe("Card", () => {
  it("composes slots for header, content, and footer", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Usage overview</CardTitle>
          <CardAction>
            <button type="button">Refresh</button>
          </CardAction>
          <CardDescription>Updated 5 minutes ago</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Body copy</p>
        </CardContent>
        <CardFooter>
          <span>Total: 24</span>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByText("Usage overview")).toHaveAttribute(
      "data-slot",
      "card-title",
    );
    expect(screen.getByText("Updated 5 minutes ago")).toHaveAttribute(
      "data-slot",
      "card-description",
    );
    expect(screen.getByText("Body copy").parentElement).toHaveAttribute(
      "data-slot",
      "card-content",
    );
    expect(screen.getByText("Total: 24").parentElement).toHaveAttribute(
      "data-slot",
      "card-footer",
    );
    expect(screen.getByRole("button", { name: "Refresh" }).parentElement).toHaveAttribute(
      "data-slot",
      "card-action",
    );
  });

  it("merges additional class names on the root slot", () => {
    render(<Card className="border-dashed">Details</Card>);

    const card = screen.getByText("Details");

    expect(card).toHaveAttribute("data-slot", "card");
    expect(card).toHaveClass("border-dashed");
  });
});
