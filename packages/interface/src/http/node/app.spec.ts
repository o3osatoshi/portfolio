import { describe, expect, it } from "vitest";

import { NotFoundError } from "../core/errors";
import { buildApp, type Deps } from "./app";

function makeDeps(overrides: Partial<Deps> = {}): Deps {
  return {
    async createTodo(input) {
      return { id: "todo-xyz", title: input.title };
    },
    async listTodos() {
      return [
        { id: "todo-1", title: "Buy milk" },
        { id: "todo-2", title: "Write tests" },
      ];
    },
    ...overrides,
  } satisfies Deps;
}

describe("http/node/app", () => {
  it("serves health check", async () => {
    const app = buildApp(makeDeps());
    const res = await app.request("/api/healthz");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("lists todos", async () => {
    const app = buildApp(makeDeps());
    const res = await app.request("/api/todos");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { id: "todo-1", title: "Buy milk" },
      { id: "todo-2", title: "Write tests" },
    ]);
  });

  it("lists empty todos successfully", async () => {
    const app = buildApp(
      makeDeps({
        async listTodos() {
          return [];
        },
      }),
    );
    const res = await app.request("/api/todos");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("creates todo (valid)", async () => {
    const app = buildApp(makeDeps());
    const res = await app.request("/api/todos", {
      body: JSON.stringify({ title: "New" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "todo-xyz", title: "New" });
  });

  it("rejects invalid create payload with 400", async () => {
    const app = buildApp(makeDeps());
    const res = await app.request("/api/todos", {
      body: JSON.stringify({ title: "" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    expect(res.status).toBe(400);
  });

  it("creates todo sets x-request-id when provided", async () => {
    const app = buildApp(makeDeps());
    const res = await app.request("/api/todos", {
      body: JSON.stringify({ title: "New" }),
      headers: {
        "x-request-id": "rid-123",
        "content-type": "application/json",
      },
      method: "POST",
    });
    expect(res.status).toBe(201);
    expect(res.headers.get("x-request-id")).toBe("rid-123");
  });

  it("creates todo sets generated x-request-id when missing", async () => {
    const app = buildApp(makeDeps());
    const res = await app.request("/api/todos", {
      body: JSON.stringify({ title: "New" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    const rid = res.headers.get("x-request-id");
    expect(res.status).toBe(201);
    expect(typeof rid).toBe("string");
    expect((rid ?? "").length).toBeGreaterThan(0);
  });

  it("serializes known errors in body for create (status stays 500)", async () => {
    const app = buildApp(
      makeDeps({
        async createTodo() {
          throw new NotFoundError("missing create");
        },
      }),
    );
    const res = await app.request("/api/todos", {
      body: JSON.stringify({ title: "New" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      code: "NOT_FOUND",
      message: "missing create",
    });
  });

  it("serializes known errors in body (status stays 500)", async () => {
    const app = buildApp(
      makeDeps({
        async listTodos() {
          throw new NotFoundError("missing");
        },
      }),
    );
    const res = await app.request("/api/todos");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ code: "NOT_FOUND", message: "missing" });
  });
});
