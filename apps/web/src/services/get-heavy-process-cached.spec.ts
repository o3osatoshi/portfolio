import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    createEdgeClientMock: vi.fn(),
    getHeavyProcessCachedRequestMock: vi.fn(),
  };
});

vi.mock("@/utils/rpc-client", () => ({
  createEdgeClient: h.createEdgeClientMock,
}));

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

import { getPath } from "@/utils/nav-handler";

import { getHeavyProcessCached } from "./get-heavy-process-cached";

describe("getHeavyProcessCached", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    h.getHeavyProcessCachedRequestMock.mockReset();
    h.createEdgeClientMock.mockReturnValue({
      edge: {
        public: {
          heavy: {
            cached: {
              $get: h.getHeavyProcessCachedRequestMock,
            },
          },
        },
      },
    });
  });

  it("returns Ok with parsed heavy process cached result when request succeeds", async () => {
    const body = {
      cached: true,
      timestamp: new Date().toISOString(),
    };

    const json = vi.fn().mockResolvedValueOnce(body);
    h.getHeavyProcessCachedRequestMock.mockResolvedValueOnce({
      json,
      ok: true,
      status: 200,
    });

    const res = await getHeavyProcessCached();

    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;

    expect(res.value).toEqual(body);

    expect(h.getHeavyProcessCachedRequestMock).toHaveBeenCalledWith(undefined, {
      init: { cache: "no-store" },
    });
  });

  it("returns Err Unauthorized when response status is 401", async () => {
    h.getHeavyProcessCachedRequestMock.mockResolvedValueOnce({
      json: vi.fn(),
      ok: false,
      status: 401,
    });

    const res = await getHeavyProcessCached();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalUnauthorizedError");
  });

  it("returns Err Serialization when remote payload is not serialized RichError", async () => {
    const body = { name: "ApplicationInternalError", message: "something bad" };

    const json = vi.fn().mockResolvedValueOnce(body);
    h.getHeavyProcessCachedRequestMock.mockResolvedValueOnce({
      json,
      ok: false,
      status: 500,
    });

    const res = await getHeavyProcessCached();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalSerializationError");
    expect(res.error.message).toContain(
      "Deserialize error body for getHeavyProcessCached",
    );
  });

  it("returns Err when remote error body cannot be deserialized", async () => {
    const jsonError = new Error("invalid json");
    const json = vi.fn().mockRejectedValueOnce(jsonError);
    h.getHeavyProcessCachedRequestMock.mockResolvedValueOnce({
      json,
      ok: false,
      status: 500,
    });

    const res = await getHeavyProcessCached();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalSerializationError");
    expect(res.error.message).toContain(
      "Deserialize error body for getHeavyProcessCached",
    );
  });

  it("returns Err when response body JSON parse fails on success status", async () => {
    const jsonError = new Error("invalid json");
    const json = vi.fn().mockRejectedValueOnce(jsonError);
    h.getHeavyProcessCachedRequestMock.mockResolvedValueOnce({
      json,
      ok: true,
      status: 200,
    });

    const res = await getHeavyProcessCached();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalSerializationError");
    expect(res.error.message).toContain(
      "Deserialize body for getHeavyProcessCached",
    );
  });

  it("returns Err when underlying request rejects (network failure)", async () => {
    const networkError = new Error("network failure");
    h.getHeavyProcessCachedRequestMock.mockRejectedValueOnce(networkError);

    const res = await getHeavyProcessCached();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalUnavailableError");
    expect(res.error.message).toContain("Fetch heavy process cached failed");
    expect(res.error.message).toContain(getPath("heavy-process-cached"));
  });
});
