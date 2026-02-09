import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    cookiesMock: vi.fn(),
  };
});

vi.mock("next/headers", () => ({
  cookies: h.cookiesMock,
}));

import { isRichError } from "@o3osatoshi/toolkit";

import { createHeaders } from "./rpc-headers";

describe("utils/rpc-headers createHeaders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("wraps cookies header in ResultAsync on success", async () => {
    const cookiesObject = {
      toString: () => "sid=test",
    };
    h.cookiesMock.mockReturnValueOnce(Promise.resolve(cookiesObject));

    const res = await createHeaders();

    expect(h.cookiesMock).toHaveBeenCalledTimes(1);
    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;

    // headers is a function returning a Cookie header
    // @ts-expect-error neverthrow unwrap
    const headers = res.value.headers();
    expect(headers).toEqual({ Cookie: "sid=test" });
  });

  it("returns a headers function that can be called multiple times", async () => {
    const cookiesObject = {
      toString: () => "sid=multi-call",
    };
    h.cookiesMock.mockReturnValueOnce(Promise.resolve(cookiesObject));

    const res = await createHeaders();

    expect(h.cookiesMock).toHaveBeenCalledTimes(1);
    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;

    const headersFn = res.value.headers;
    // @ts-expect-error
    const h1 = headersFn();
    // @ts-expect-error
    const h2 = headersFn();

    expect(h1).toEqual({ Cookie: "sid=multi-call" });
    expect(h2).toEqual({ Cookie: "sid=multi-call" });
  });

  it("returns Err with InfrastructureInternalError when cookies retrieval fails", async () => {
    const cause = new Error("cookies failed");
    h.cookiesMock.mockReturnValueOnce(Promise.reject(cause));

    const res = await createHeaders();

    expect(h.cookiesMock).toHaveBeenCalledTimes(1);
    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("InfrastructureInternalError");
    expect(isRichError(res.error)).toBe(true);
    if (isRichError(res.error)) {
      expect(res.error.details?.action).toBe("ReadRequestCookies");
    }
  });
});
