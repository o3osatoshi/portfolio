import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "@/mocks/server";

function resolveUnhandledRequestMode(): "bypass" | "error" | "warn" {
  const raw = process.env["MSW_ON_UNHANDLED_REQUEST"]?.toLowerCase();
  if (raw === "bypass" || raw === "error" || raw === "warn") return raw;
  return process.env["CI"] ? "error" : "warn";
}

beforeAll(() => {
  server.listen({ onUnhandledRequest: resolveUnhandledRequestMode() });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
