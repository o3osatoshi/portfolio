import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    createEdgeClientMock: vi.fn(),
    createHeadersMock: vi.fn(),
    getMeRequestMock: vi.fn(),
  };
});

vi.mock("@/utils/rpc-client", () => ({
  createEdgeClient: h.createEdgeClientMock,
}));

vi.mock("@/utils/rpc-headers", () => ({
  createHeaders: h.createHeadersMock,
}));

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

import { getPath } from "@/utils/nav-handler";

import { getMe } from "./get-me";

describe("getMe", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    h.getMeRequestMock.mockReset();
    h.createEdgeClientMock.mockReturnValue({
      edge: {
        private: {
          me: {
            $get: h.getMeRequestMock,
          },
        },
      },
    });
  });

  it("returns Ok with parsed me when headers and request succeed", async () => {
    const body = {
      id: "u1",
      name: "Alice",
    };

    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({ Cookie: "sid=test" }),
      }),
    );

    const json = vi.fn().mockResolvedValueOnce(body);
    h.getMeRequestMock.mockResolvedValueOnce({
      json,
      ok: true,
      status: 200,
    });

    const res = await getMe();

    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;

    expect(res.value.id).toBe(body.id);
    expect(res.value.name).toBe(body.name);

    const expectedTag = getPath("me");
    expect(h.getMeRequestMock).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        init: {
          next: { tags: [expectedTag] },
        },
      }),
    );
  });

  it("returns Err when createHeaders fails", async () => {
    const headersError = new Error("failed to create headers");
    h.createHeadersMock.mockReturnValueOnce(errAsync(headersError));

    const res = await getMe();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBe(headersError);
    expect(h.getMeRequestMock).not.toHaveBeenCalled();
  });

  it("returns Err Unauthorized when response status is 401", async () => {
    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({}),
      }),
    );

    h.getMeRequestMock.mockResolvedValueOnce({
      json: vi.fn(),
      ok: false,
      status: 401,
    });

    const res = await getMe();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
  });

  it("returns Err with deserialized remote error when response is non-2xx", async () => {
    const body = { name: "ApplicationNotFoundError", message: "not found" };

    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({}),
      }),
    );

    const json = vi.fn().mockResolvedValueOnce(body);
    h.getMeRequestMock.mockResolvedValueOnce({
      json,
      ok: false,
      status: 404,
    });

    const res = await getMe();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ApplicationNotFoundError");
    expect(res.error.message).toBe("not found");
  });

  it("returns Err when remote error body cannot be deserialized", async () => {
    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({}),
      }),
    );

    const jsonError = new Error("invalid json");
    const json = vi.fn().mockRejectedValueOnce(jsonError);
    h.getMeRequestMock.mockResolvedValueOnce({
      json,
      ok: false,
      status: 500,
    });

    const res = await getMe();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalSerializationError");
    expect(res.error.message).toContain("Deserialize error body for getMe");
  });

  it("returns Err when response body JSON parse fails on success status", async () => {
    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({}),
      }),
    );

    const jsonError = new Error("invalid json");
    const json = vi.fn().mockRejectedValueOnce(jsonError);
    h.getMeRequestMock.mockResolvedValueOnce({
      json,
      ok: true,
      status: 200,
    });

    const res = await getMe();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalSerializationError");
    expect(res.error.message).toContain("Deserialize body for getMe");
  });

  it("returns Err when underlying request rejects (network failure)", async () => {
    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({}),
      }),
    );

    const networkError = new Error("network failure");
    h.getMeRequestMock.mockRejectedValueOnce(networkError);

    const res = await getMe();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalUnavailableError");
    expect(res.error.message).toContain("Fetch me failed");
  });
});
