import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    createEdgeRpcClientMock: vi.fn(),
    createRpcClientMock: vi.fn(),
  };
});

vi.mock("@repo/interface/rpc-client", () => ({
  createEdgeRpcClient: h.createEdgeRpcClientMock,
  createRpcClient: h.createRpcClientMock,
}));

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

import { createClient, createEdgeClient } from "./rpc-client";

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
    expect(options.init?.cache).toBe("no-store");
    expect(options.init?.next?.revalidate).toBe(60);
    expect(options.init?.next?.tags).toEqual(["t1"]);
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

  it("creates Edge RPC client with supplied options", () => {
    const client = {};
    h.createEdgeRpcClientMock.mockReturnValueOnce(client);

    const options = {
      init: {
        cache: "force-cache" as const,
        next: {
          revalidate: false as const,
          tags: ["edge-tag"],
        },
      },
    };

    const res = createEdgeClient(options);

    expect(h.createEdgeRpcClientMock).toHaveBeenCalledWith(
      "https://example.com",
      options,
    );
    expect(res).toBe(client);
    expect(options.init?.cache).toBe("force-cache");
    expect(options.init?.next?.revalidate).toBe(false);
    expect(options.init?.next?.tags).toEqual(["edge-tag"]);
  });
});
