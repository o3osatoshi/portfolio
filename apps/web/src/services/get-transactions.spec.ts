import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockedFunction } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

import { cookies } from "next/headers";

import { getTransactions } from "./get-transactions";

const mockedCookies = cookies as unknown as MockedFunction<typeof cookies>;

describe("getTransactions", () => {
  beforeEach(() => {
    mockedCookies.mockReset();
    // @ts-expect-error cookie store mock does not implement full interface
    mockedCookies.mockResolvedValue({ toString: () => "sid=test" });
  });

  it("returns Ok with parsed transactions when response is 2xx", async () => {
    const now = new Date();
    const body = [
      {
        id: "t1",
        amount: "1.0",
        createdAt: now.toISOString(),
        currency: "USD",
        datetime: now.toISOString(),
        price: "100.0",
        type: "BUY",
        updatedAt: now.toISOString(),
        userId: "u1",
      },
    ];

    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(body), {
        headers: { "content-type": "application/json" },
        status: 200,
      }),
    );

    const res = await getTransactions();
    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;
    expect(Array.isArray(res.value)).toBe(true);
    expect(res.value[0]?.id).toBe("t1");
    expect(res.value[0]?.createdAt).toBe(body[0]?.createdAt);
    expect(res.value[0]?.datetime).toBe(body[0]?.datetime);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns Err with deserialized Error when response is non-2xx", async () => {
    const body = { name: "ApplicationNotFoundError", message: "not found" };
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify(body), {
        headers: { "content-type": "application/json" },
        status: 404,
      }),
    );

    const res = await getTransactions();
    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;
    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ApplicationNotFoundError");
    expect(res.error.message).toBe("not found");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("propagates fetch failures as rejections", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockRejectedValue(new Error("network"));

    await expect(getTransactions()).rejects.toThrow("network");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
