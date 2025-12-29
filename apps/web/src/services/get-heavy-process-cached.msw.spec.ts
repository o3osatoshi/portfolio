import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

import { server } from "@/mocks/server";
import { getPath } from "@/utils/nav-handler";

import { getHeavyProcessCached } from "./get-heavy-process-cached";

describe("getHeavyProcessCached (msw)", () => {
  it("returns Ok with the mock response", async () => {
    const res = await getHeavyProcessCached();

    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;

    expect(res.value.cached).toBe(true);
    expect(typeof res.value.timestamp).toBe("string");
  });

  it("returns Err when the response is unauthorized", async () => {
    server.use(
      http.get(getPath("heavy-process-cached"), () =>
        HttpResponse.json({ message: "unauthorized" }, { status: 401 }),
      ),
    );

    const res = await getHeavyProcessCached();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error.name).toBe("ExternalUnauthorizedError");
  });
});
