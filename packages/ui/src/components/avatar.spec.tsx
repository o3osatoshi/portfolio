import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar, AvatarFallback } from "./avatar";

describe("Avatar", () => {
  it("adds data attributes and merges class names on the root", () => {
    const { container } = render(
      <Avatar className="ring-2 ring-primary" />,
    );

    const avatar = container.querySelector('[data-slot="avatar"]');

    expect(avatar).not.toBeNull();
    expect(avatar).toHaveClass("ring-primary");
  });

  it("exposes the fallback slot", async () => {
    const { container } = render(
      <Avatar>
        <AvatarFallback delayMs={0} className="bg-emerald-500">
          OS
        </AvatarFallback>
      </Avatar>,
    );

    await waitFor(() => {
      const fallback = container.querySelector('[data-slot="avatar-fallback"]');

      expect(fallback).not.toBeNull();
      expect(fallback).toHaveTextContent("OS");
      expect(fallback).toHaveClass("bg-emerald-500");
    });
  });
});
