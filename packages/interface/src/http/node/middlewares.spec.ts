import { Hono } from "hono";
import { describe, expect, it } from "vitest";

import { requestIdMiddleware } from "../core/middlewares";
import type { ContextEnv } from "../core/types";
import { loggerMiddleware } from "./middlewares";

describe("http/node middlewares", () => {
  it("attaches logger helpers to the request context", async () => {
    const app = new Hono<ContextEnv>();

    app.use("*", requestIdMiddleware, loggerMiddleware);
    app.get("/t", (c) =>
      c.json({
        hasLogger: typeof c.get("logger")?.info === "function",
        hasRequestLogger:
          typeof c.get("requestLogger")?.setUserId === "function",
      }),
    );

    const res = await app.request("/t");
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      hasLogger: true,
      hasRequestLogger: true,
    });
  });
});
