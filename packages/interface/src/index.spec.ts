import { describe, expect, it, vi } from "vitest";

// Capture the fetch handler passed to the server so we can test without starting a real server
let capturedFetch: any;

vi.mock("@hono/node-server", () => {
  return {
    serve: (
      options: { fetch: (req: any) => Promise<any>; port?: number },
      listeningListener?: (info: { port: number }) => void,
    ) => {
      capturedFetch = options.fetch;
      listeningListener?.({ port: options.port ?? 3000 });
      // Return a minimal stub server object; tests don't rely on it
      return { close: vi.fn() } as unknown as object;
    },
  };
});

// Import after mocking so index.ts runs with the mocked server
await import("./index");

describe("interface app", () => {
  it("responds with Hello Hono! on GET /", async () => {
    expect(typeof capturedFetch).toBe("function");
    const res = await capturedFetch!(new Request("http://localhost:3000/"));
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toBe("Hello Hono!");
  });
});
