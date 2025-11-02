import { Hono } from "hono";
import { describe, expect, it, vi } from "vitest";

vi.mock("firebase-functions/v2/https", () => ({
  onRequest: vi.fn((cb: (req: unknown, res: unknown) => Promise<void>) => cb),
}));

import { onRequest } from "firebase-functions/v2/https";

import { createFirebaseHandler } from "./adapter-firebase";

describe("node/adapter-firebase", () => {
  it("bridges hono app to firebase request/response", async () => {
    const app = new Hono();
    app.get("/t", (c) => {
      c.res.headers.set("x-custom", "1");
      return c.text("pong");
    });

    const handler = createFirebaseHandler(app) as unknown as (
      req: TestReq,
      res: TestRes,
    ) => Promise<void>;

    // The mocked onRequest returns the callback; ensure it's a function
    expect(typeof handler).toBe("function");

    type TestReq = {
      headers: Record<string, string>;
      method: string;
      url: string;
    };
    const req: TestReq = {
      headers: {},
      method: "GET",
      url: "http://localhost/t",
    };

    type TestRes = {
      body: Buffer;
      headers: Map<string, string>;
      send: (buf: Buffer) => void;
      setHeader: (key: string, value: string) => void;
      status: (code: number) => TestRes;
      statusCode: number;
    };
    const res: TestRes = {
      body: Buffer.alloc(0),
      headers: new Map<string, string>(),
      send(this: TestRes, buf: Buffer) {
        this.body = buf;
      },
      setHeader(key: string, value: string) {
        this.headers.set(key, value);
      },
      status(this: TestRes, code: number) {
        this.statusCode = code;
        return this;
      },
      statusCode: 0,
    };

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers.get("x-custom")).toBe("1");
    expect(String(res.body)).toBe("pong");

    expect(onRequest).toHaveBeenCalledTimes(1);
  });
});
