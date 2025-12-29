import { okAsync } from "neverthrow";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    createHeadersMock: vi.fn(),
  };
});

vi.mock("@/utils/rpc-headers", () => ({
  createHeaders: h.createHeadersMock,
}));

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

import { server } from "@/mocks/server";
import { getPath } from "@/utils/nav-handler";

import { getTransactions } from "./get-transactions";

describe("getTransactions (msw)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.createHeadersMock.mockReturnValue(
      okAsync({
        headers: () => ({ Cookie: "sid=test" }),
      }),
    );
  });

  it("returns Ok with the mock transactions", async () => {
    const res = await getTransactions();

    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;

    expect(Array.isArray(res.value)).toBe(true);
    expect(res.value[0]?.userId).toBe("u-msw");
  });

  it("returns Err when the response is unauthorized", async () => {
    server.use(
      http.get(getPath("labs-transactions"), () =>
        HttpResponse.json({ message: "unauthorized" }, { status: 401 }),
      ),
    );

    const res = await getTransactions();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error.name).toBe("ExternalUnauthorizedError");
  });
});
