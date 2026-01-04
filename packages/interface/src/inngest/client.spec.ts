import { describe, expect, it, vi } from "vitest";

let lastOptions: unknown;

vi.mock("inngest", () => {
  return {
    Inngest: class {
      constructor(options: unknown) {
        lastOptions = options;
      }
    },
  };
});

import { createInngestClient } from "./client";

describe("createInngestClient", () => {
  it("passes id and eventKey to the Inngest constructor", () => {
    lastOptions = undefined;
    const client = createInngestClient({
      id: "store-ping-app",
      eventKey: "event-key",
    });

    expect(client).toBeTruthy();
    expect(lastOptions).toEqual({
      id: "store-ping-app",
      eventKey: "event-key",
    });
  });

  it("rejects creating a client without an event key", () => {
    lastOptions = undefined;
    // @ts-expect-error
    expect(() => createInngestClient({ id: "store-ping-app" })).toThrow(
      "Inngest event key is required",
    );
    expect(lastOptions).toBeUndefined();
  });
});
