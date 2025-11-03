import { describe, expect, it } from "vitest";

import app from "./index";

describe("http/edge/index", () => {
  it("serves health check", async () => {
    const res = await app.request("/edge/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("lists todos from edge deps", async () => {
    const res = await app.request("/edge/todos");
    expect(res.status).toBe(200);
    const body = (await res.json()) as Array<{ id: string; title: string }>;
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2);
    expect(body[0]).toHaveProperty("id");
    expect(body[0]).toHaveProperty("title");
  });

  it("creates todo via POST and returns an id", async () => {
    const res = await app.request("/edge/todos", {
      body: JSON.stringify({ title: "Edge created" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: string; title: string };
    expect(body.title).toBe("Edge created");
    expect(typeof body.id).toBe("string");
    expect(body.id.length).toBeGreaterThan(0);
  });
});
