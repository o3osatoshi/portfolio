import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";

import { loggerMiddleware, requestIdMiddleware } from "./middlewares";

describe("middlewares", () => {
  it("logs request summary", async () => {
    const app = new Hono();
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    app.use("*", loggerMiddleware);
    app.get("/t", (c) => c.text("ok"));

    const res = await app.request("/t");
    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalled();
    const arg = String(spy.mock.calls.at(-1)?.[0] ?? "");
    expect(arg).toContain("GET /t -> 200 (");
    spy.mockRestore();
  });

  it("propagates incoming x-request-id and exposes it in context", async () => {
    const app = new Hono<{ Variables: { requestId: string } }>();
    app.use("*", requestIdMiddleware);
    app.get("/t", (c) => c.json({ requestId: String(c.get("requestId")) }));

    const res = await app.request("/t", {
      headers: { "x-request-id": "abc-123" },
    });
    expect(res.status).toBe(200);
    expect(res.headers.get("x-request-id")).toBe("abc-123");
    expect(await res.json()).toEqual({ requestId: "abc-123" });
  });

  it("generates request id when absent and sets header", async () => {
    const app = new Hono<{ Variables: { requestId: string } }>();
    app.use("*", requestIdMiddleware);
    app.get("/t", (c) => c.json({ requestId: String(c.get("requestId")) }));

    const res = await app.request("/t");
    const rid = res.headers.get("x-request-id");
    expect(res.status).toBe(200);
    expect(typeof rid).toBe("string");
    expect((rid ?? "").length).toBeGreaterThan(0);
    expect(await res.json()).toEqual({ requestId: String(rid) });
  });
});
