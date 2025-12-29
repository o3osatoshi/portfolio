import type { Context } from "hono";
import { routePath } from "hono/route";

import type { RequestContext } from "@o3osatoshi/logging";

import type { ContextEnv } from "./types";

const CLIENT_IP_HEADERS = [
  "cf-connecting-ip",
  "x-real-ip",
  "true-client-ip",
  "x-client-ip",
];

export function buildRequestContext(c: Context<ContextEnv>): RequestContext {
  return {
    clientIp: resolveClientIp(c),
    httpMethod: c.req.method,
    httpRoute: resolveRoute(c),
    requestId: resolveRequestId(c),
    traceparent: normalizeValue(c.req.header("traceparent")),
    userAgent: normalizeValue(c.req.header("user-agent")),
  };
}

function normalizeValue(value: null | string | undefined): string | undefined {
  if (!value) return undefined;
  const _value = value.trim();
  if (!_value || _value.toLowerCase() === "unknown") return undefined;
  return _value;
}

function resolveClientIp(c: Context): string | undefined {
  const forwarded = normalizeValue(c.req.header("x-forwarded-for"));
  if (forwarded) {
    const [first] = forwarded.split(",");
    return normalizeValue(first);
  }

  for (const header of CLIENT_IP_HEADERS) {
    const value = normalizeValue(c.req.header(header));
    if (value) return value;
  }

  return undefined;
}

function resolveRequestId(c: Context): string | undefined {
  const stored = c.get("requestId");
  if (typeof stored === "string" && stored.length > 0) {
    return stored;
  }
  return normalizeValue(c.req.header("x-request-id"));
}

function resolveRoute(c: Context): string | undefined {
  const path = c.req.path;
  if (path && !path.includes("*")) return path;
  return routePath(c);
}
