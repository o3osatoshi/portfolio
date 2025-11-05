import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { createExpressRequestHandler } from "./adapter-express";

describe("node/adapter-express", () => {
  it("bridges hono app to express request/response", async () => {
    const app = new Hono();
    app.get("/t", (c) => c.text("pong"));

    type TestReq = {
      body?: unknown;
      headers: Record<string, string>;
      hostname: string;
      method: string;
      protocol: string;
      url: string;
    };
    type TestRes = {
      bodyText?: string;
      headers: Record<string, string | string[]>;
      json: (data: unknown) => void;
      jsonBody?: unknown;
      send: (content: unknown) => void;
      setHeader: (key: string, value: string | string[]) => void;
      status: (code: number) => TestRes;
      statusCode?: number;
    };

    const handler = createExpressRequestHandler(app) as unknown as (
      req: TestReq,
      res: TestRes,
    ) => Promise<void>;

    expect(typeof handler).toBe("function");

    const req: TestReq = {
      hostname: "localhost",
      headers: {},
      method: "GET",
      protocol: "http",
      url: "/t",
    };

    const res: TestRes = {
      headers: {},
      json(this: TestRes, data: unknown) {
        this.jsonBody = data;
      },
      send(this: TestRes, content: unknown) {
        this.bodyText = String(content);
      },
      setHeader(this: TestRes, key: string, value: string | string[]) {
        this.headers[key.toLowerCase()] = value;
      },
      status(this: TestRes, code: number) {
        this.statusCode = code;
        return this;
      },
    };

    await handler(req, res);

    expect(res.jsonBody).toBeUndefined();
    expect(res.bodyText).toBe("pong");
  });

  it("forwards response headers to express response", async () => {
    const app = new Hono();
    app.get("/h", (c) => {
      c.header("cache-control", "public, max-age=60");
      c.header("x-request-id", "req-123");
      c.header("x-custom", "abc");
      return c.text("ok");
    });

    type TestReq = {
      body?: unknown;
      headers: Record<string, string>;
      hostname: string;
      method: string;
      protocol: string;
      url: string;
    };
    type TestRes = {
      bodyText?: string;
      headers: Record<string, string | string[]>;
      json: (data: unknown) => void;
      jsonBody?: unknown;
      send: (content: unknown) => void;
      setHeader: (key: string, value: string | string[]) => void;
      status: (code: number) => TestRes;
      statusCode?: number;
    };

    const handler = createExpressRequestHandler(app) as unknown as (
      req: TestReq,
      res: TestRes,
    ) => Promise<void>;

    const req: TestReq = {
      hostname: "localhost",
      headers: {},
      method: "GET",
      protocol: "http",
      url: "/h",
    };

    const res: TestRes = {
      headers: {},
      json(this: TestRes, data: unknown) {
        this.jsonBody = data;
      },
      send(this: TestRes, content: unknown) {
        this.bodyText = String(content);
      },
      setHeader(this: TestRes, key: string, value: string | string[]) {
        this.headers[key.toLowerCase()] = value;
      },
      status(this: TestRes, code: number) {
        this.statusCode = code;
        return this;
      },
    };

    await handler(req, res);

    expect(res.bodyText).toBe("ok");
    expect(res.headers["cache-control"]).toBe("public, max-age=60");
    expect(res.headers["x-request-id"]).toBe("req-123");
    expect(res.headers["x-custom"]).toBe("abc");
  });
});
