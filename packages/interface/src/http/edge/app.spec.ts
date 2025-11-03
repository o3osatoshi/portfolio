import { describe, expect, it } from "vitest";

import { NotFoundError } from "../core/errors";
import { buildEdgeApp, type EdgeDeps } from "./app";

function makeDeps(overrides: Partial<EdgeDeps> = {}): EdgeDeps {
  return {
    async createTodo(input) {
      return { id: "edge-xyz", title: input.title };
    },
    async listTodos() {
      return [
        { id: "edge-1", title: "Edge A" },
        { id: "edge-2", title: "Edge B" },
      ];
    },
    ...overrides,
  } satisfies EdgeDeps;
}

describe("http/edge/app", () => {
  it("serves health check", async () => {
    const app = buildEdgeApp(makeDeps());
    const res = await app.request("/edge/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("rejects invalid create payload with 400", async () => {
    const app = buildEdgeApp(makeDeps());
    const res = await app.request("/edge/todos", {
      body: JSON.stringify({ title: "" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    expect(res.status).toBe(400);
  });

  it("propagates incoming x-request-id and exposes it in context", async () => {
    const app = buildEdgeApp(makeDeps());
    const res = await app.request("/edge/todos", {
      body: JSON.stringify({ title: "Edge" }),
      headers: {
        "x-request-id": "rid-edge-123",
        "content-type": "application/json",
      },
      method: "POST",
    });
    expect(res.status).toBe(201);
    expect(res.headers.get("x-request-id")).toBe("rid-edge-123");
  });

  it("generates x-request-id when missing", async () => {
    const app = buildEdgeApp(makeDeps());
    const res = await app.request("/edge/todos", {
      body: JSON.stringify({ title: "Edge" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const rid = res.headers.get("x-request-id");
    expect(res.status).toBe(201);
    expect(typeof rid).toBe("string");
    expect((rid ?? "").length).toBeGreaterThan(0);
  });

  it("serializes known errors in body (status stays 500) for list", async () => {
    const app = buildEdgeApp(
      makeDeps({
        async listTodos() {
          throw new NotFoundError("edge-missing");
        },
      }),
    );
    const res = await app.request("/edge/todos");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      code: "NOT_FOUND",
      message: "edge-missing",
    });
  });

  it("serializes known errors in body (status stays 500) for create", async () => {
    const app = buildEdgeApp(
      makeDeps({
        async createTodo() {
          throw new NotFoundError("edge-create-missing");
        },
      }),
    );
    const res = await app.request("/edge/todos", {
      body: JSON.stringify({ title: "Edge" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      code: "NOT_FOUND",
      message: "edge-create-missing",
    });
  });
});
