import { describe, expect, it } from "vitest";

import { app, GET, POST } from "./index";

describe("node/index", () => {
  it("exports an app that serves /api/healthz", async () => {
    const res = await app.request("/api/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("GET handler responds to healthz", async () => {
    const res = await GET(new Request("http://test.local/api/healthz"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("POST handler creates todo", async () => {
    const req = new Request("http://test.local/api/todos", {
      body: JSON.stringify({ title: "From GET/POST" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = (await res.json()) as { id: string; title: string };
    expect(body.title).toBe("From GET/POST");
    expect(body.id.startsWith("todo-")).toBe(true);
  });
});
