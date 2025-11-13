import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { MockedFunction } from "vitest";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/utils/next-fetch", () => ({
  nextFetch: vi.fn(),
}));

import { cookies } from "next/headers";

import { nextFetch } from "@/utils/next-fetch";

import { getTransactions } from "./get-transactions";

const mockedNextFetch = nextFetch as unknown as MockedFunction<
  typeof nextFetch
>;
const mockedCookies = cookies as unknown as MockedFunction<typeof cookies>;

describe("getTransactions", () => {
  beforeEach(() => {
    mockedNextFetch.mockReset();
    mockedCookies.mockReset();
    // biome-ignore lint/suspicious/noExplicitAny: allow any for mocked return
    mockedCookies.mockResolvedValue({ toString: () => "sid=test" } as any);
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

    type NextResponseShape = {
      body: unknown;
    } & Pick<Response, "ok" | "redirected" | "status" | "statusText" | "url">;

    const okResponse: NextResponseShape = {
      body,
      ok: true,
      redirected: false,
      status: 200,
      statusText: "OK",
      url: "http://test/api",
    };
    mockedNextFetch.mockReturnValue(
      okAsync<NextResponseShape, Error>(okResponse),
    );

    const res = await getTransactions();
    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;
    expect(Array.isArray(res.value)).toBe(true);
    expect(res.value[0]?.id).toBe("t1");
    expect(res.value[0]?.createdAt instanceof Date).toBe(true);
    expect(res.value[0]?.datetime instanceof Date).toBe(true);
  });

  it("returns Err with deserialized Error when response is non-2xx", async () => {
    const body = { name: "ApplicationNotFoundError", message: "not found" };
    type NextResponseShape = {
      body: unknown;
    } & Pick<Response, "ok" | "redirected" | "status" | "statusText" | "url">;
    const notOkResponse: NextResponseShape = {
      body,
      ok: false,
      redirected: false,
      status: 404,
      statusText: "Not Found",
      url: "http://test/api",
    };
    mockedNextFetch.mockReturnValue(
      okAsync<NextResponseShape, Error>(notOkResponse),
    );

    const res = await getTransactions();
    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;
    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ApplicationNotFoundError");
    expect(res.error.message).toBe("not found");
  });

  it("propagates Err from nextFetch failures", async () => {
    type NextResponseShape = {
      body: unknown;
    } & Pick<Response, "ok" | "redirected" | "status" | "statusText" | "url">;
    mockedNextFetch.mockReturnValue(
      errAsync<NextResponseShape, Error>(new Error("network")),
    );

    const res = await getTransactions();
    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;
    expect(res.error.message).toContain("network");
  });
});
