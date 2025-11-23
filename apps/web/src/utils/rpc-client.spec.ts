import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    cookiesMock: vi.fn(),
    createEdgeRpcClientMock: vi.fn(),
    createRpcClientMock: vi.fn(),
  };
});

vi.mock("@repo/interface/rpc-client", () => ({
  createEdgeRpcClient: h.createEdgeRpcClientMock,
  createRpcClient: h.createRpcClientMock,
}));

vi.mock("next/headers", () => ({
  cookies: h.cookiesMock,
}));

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

import { createClient, createEdgeClient, createHeaders } from "./rpc-client";

describe("utils/rpc-client createClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates RPC client with base URL and no options", () => {
    const client = {};
    h.createRpcClientMock.mockReturnValueOnce(client);

    const res = createClient();

    expect(h.createRpcClientMock).toHaveBeenCalledWith(
      "https://example.com",
      undefined,
    );
    expect(res).toBe(client);
  });

  it("creates RPC client with supplied options", () => {
    const client = {};
    h.createRpcClientMock.mockReturnValueOnce(client);

    const options = {
      init: {
        cache: "no-store" as const,
        next: {
          revalidate: 60 as const,
          tags: ["t1"],
        },
      },
    };

    const res = createClient(options);

    expect(h.createRpcClientMock).toHaveBeenCalledWith(
      "https://example.com",
      options,
    );
    expect(res).toBe(client);
  });
});

describe("utils/rpc-client createEdgeClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates Edge RPC client with base URL", () => {
    const client = {};
    h.createEdgeRpcClientMock.mockReturnValueOnce(client);

    const res = createEdgeClient();

    expect(h.createEdgeRpcClientMock).toHaveBeenCalledWith(
      "https://example.com",
      undefined,
    );
    expect(res).toBe(client);
  });
});

describe("utils/rpc-client createHeaders", () => {
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

    // @ts-expect-error
    const headers = res.value.headers();
    expect(headers).toEqual({ Cookie: "sid=test" });
  });

  it("returns Err with InfraUnknownError when cookies retrieval fails", async () => {
    const cause = new Error("cookies failed");
    h.cookiesMock.mockReturnValueOnce(Promise.reject(cause));

    const res = await createHeaders();

    expect(h.cookiesMock).toHaveBeenCalledTimes(1);
    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("InfraUnknownError");
    const payload = JSON.parse(res.error.message);
    expect(payload.summary).toBe("Call cookies failed");
  });
});
