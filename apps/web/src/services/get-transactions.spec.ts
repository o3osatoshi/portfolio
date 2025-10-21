import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockedFunction } from "vitest";

vi.mock("@/utils/next-fetch", () => ({
  nextFetch: vi.fn(),
}));

import { nextFetch } from "@/utils/next-fetch";

import { getTransactions } from "./get-transactions";

const mockedNextFetch = nextFetch as unknown as MockedFunction<
  typeof nextFetch
>;

describe("getTransactions", () => {
  beforeEach(() => {
    mockedNextFetch.mockReset();
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

    mockedNextFetch.mockReturnValue(
      okAsync({
        body,
        ok: true,
        redirected: false,
        status: 200,
        statusText: "OK",
        url: "http://test/api",
      } as any),
    );

    const res = await getTransactions({ userId: "u1" });
    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;
    expect(Array.isArray(res.value)).toBe(true);
    expect(res.value[0]?.id).toBe("t1");
    expect(res.value[0]?.createdAt instanceof Date).toBe(true);
    expect(res.value[0]?.datetime instanceof Date).toBe(true);
  });

  it("returns Err with deserialized Error when response is non-2xx", async () => {
    const body = { name: "ApplicationNotFoundError", message: "not found" };
    mockedNextFetch.mockReturnValue(
      okAsync({
        body,
        ok: false,
        redirected: false,
        status: 404,
        statusText: "Not Found",
        url: "http://test/api",
      } as any),
    );

    const res = await getTransactions({ userId: "u1" });
    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;
    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ApplicationNotFoundError");
    expect(res.error.message).toBe("not found");
  });

  it("propagates Err from nextFetch failures", async () => {
    mockedNextFetch.mockReturnValue(errAsync(new Error("network")) as any);

    const res = await getTransactions({ userId: "u1" });
    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;
    expect(res.error.message).toContain("network");
  });
});
