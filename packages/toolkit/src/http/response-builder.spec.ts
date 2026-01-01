import { describe, expect, it } from "vitest";

import { buildHttpResponse } from "./response-builder";

describe("toolkit response-builder", () => {
  it("builds a normalized response with optional metadata", () => {
    const payload = { ok: true };
    const response = new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
      status: 201,
      statusText: "Created",
    });

    const result = buildHttpResponse(payload, response, {
      cache: { hit: true, key: "cache:key" },
      retry: { attempts: 2 },
    });

    expect(result.data).toEqual(payload);
    expect(result.response.ok).toBe(response.ok);
    expect(result.response.status).toBe(response.status);
    expect(result.response.statusText).toBe(response.statusText);
    expect(result.response.redirected).toBe(response.redirected);
    expect(result.response.url).toBe(response.url);
    expect(result.response.headers.get("content-type")).toBe(
      "application/json",
    );
    expect(result.cache).toEqual({ hit: true, key: "cache:key" });
    expect(result.retry).toEqual({ attempts: 2 });
  });

  it("omits optional metadata when not provided", () => {
    const response = new Response("ok", { status: 200 });
    const result = buildHttpResponse("payload", response);

    expect(result.data).toBe("payload");
    expect(result.response.status).toBe(200);
    expect(result.cache).toBeUndefined();
    expect(result.retry).toBeUndefined();
    expect(Object.hasOwn(result, "cache")).toBe(false);
    expect(Object.hasOwn(result, "retry")).toBe(false);
  });

  it("supports cache-only metadata", () => {
    const response = new Response("ok", { status: 200 });
    const result = buildHttpResponse("payload", response, {
      cache: { hit: false },
    });

    expect(result.cache).toEqual({ hit: false });
    expect(result.retry).toBeUndefined();
    expect(Object.hasOwn(result, "retry")).toBe(false);
  });
});
