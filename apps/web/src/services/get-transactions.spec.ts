import { errAsync, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    createClientMock: vi.fn(),
    createHeadersMock: vi.fn(),
    getMeMock: vi.fn(),
    getTransactionsRequestMock: vi.fn(),
  };
});

vi.mock("@/services/get-me", () => ({
  getMe: h.getMeMock,
}));

vi.mock("@/utils/rpc-client", () => ({
  createClient: h.createClientMock,
  createHeaders: h.createHeadersMock,
}));

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

import { getTag } from "@/utils/nav-handler";

import { getTransactions } from "./get-transactions";

describe("getTransactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    h.getTransactionsRequestMock.mockReset();
    h.createClientMock.mockReturnValue({
      api: {
        private: {
          labs: {
            transactions: {
              $get: h.getTransactionsRequestMock,
            },
          },
        },
      },
    });
  });

  it("returns Ok with parsed transactions when getMe, headers and request succeed", async () => {
    const now = new Date();
    const me = { id: "u1" };
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

    h.getMeMock.mockReturnValueOnce(okAsync(me));
    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({ Cookie: "sid=test" }),
      }),
    );

    const json = vi.fn().mockResolvedValueOnce(body);
    h.getTransactionsRequestMock.mockResolvedValueOnce({
      json,
      ok: true,
      status: 200,
    });

    const res = await getTransactions();

    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;

    expect(Array.isArray(res.value)).toBe(true);
    expect(res.value[0]?.id).toBe("t1");
    expect(res.value[0]?.createdAt).toBe(body[0]?.createdAt);
    expect(res.value[0]?.datetime).toBe(body[0]?.datetime);

    const expectedTag = getTag("labs-transactions", { userId: me.id });
    expect(h.getTransactionsRequestMock).toHaveBeenCalledWith(
      undefined,
      expect.objectContaining({
        init: {
          next: { tags: [expectedTag] },
        },
      }),
    );
  });

  it("returns Err when getMe fails", async () => {
    const authError = new Error("not authenticated");
    h.getMeMock.mockReturnValueOnce(errAsync(authError));

    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({}),
      }),
    );

    const res = await getTransactions();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBe(authError);
    expect(h.createHeadersMock).not.toHaveBeenCalled();
    expect(h.getTransactionsRequestMock).not.toHaveBeenCalled();
  });

  it("returns Err Unauthorized when response status is 401", async () => {
    const me = { id: "u1" };
    h.getMeMock.mockReturnValueOnce(okAsync(me));
    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({}),
      }),
    );

    h.getTransactionsRequestMock.mockResolvedValueOnce({
      json: vi.fn(),
      ok: false,
      status: 401,
    });

    const res = await getTransactions();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
  });

  it("returns Err with deserialized remote error when response is non-2xx", async () => {
    const me = { id: "u1" };
    const body = { name: "ApplicationNotFoundError", message: "not found" };

    h.getMeMock.mockReturnValueOnce(okAsync(me));
    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({}),
      }),
    );

    const json = vi.fn().mockResolvedValueOnce(body);
    h.getTransactionsRequestMock.mockResolvedValueOnce({
      json,
      ok: false,
      status: 404,
    });

    const res = await getTransactions();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ApplicationNotFoundError");
    expect(res.error.message).toBe("not found");
  });

  it("returns Err when remote error body cannot be deserialized", async () => {
    const me = { id: "u1" };

    h.getMeMock.mockReturnValueOnce(okAsync(me));
    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({}),
      }),
    );

    const jsonError = new Error("invalid json");
    const json = vi.fn().mockRejectedValueOnce(jsonError);
    h.getTransactionsRequestMock.mockResolvedValueOnce({
      json,
      ok: false,
      status: 500,
    });

    const res = await getTransactions();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalSerializationError");
    expect(res.error.message).toContain(
      "Deserialize error body for getTransactions",
    );
  });

  it("returns Err when response body JSON parse fails on success status", async () => {
    const me = { id: "u1" };

    h.getMeMock.mockReturnValueOnce(okAsync(me));
    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({}),
      }),
    );

    const jsonError = new Error("invalid json");
    const json = vi.fn().mockRejectedValueOnce(jsonError);
    h.getTransactionsRequestMock.mockResolvedValueOnce({
      json,
      ok: true,
      status: 200,
    });

    const res = await getTransactions();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalSerializationError");
    expect(res.error.message).toContain("Deserialize body for getTransactions");
  });

  it("returns Err when underlying request rejects (network failure)", async () => {
    const me = { id: "u1" };

    h.getMeMock.mockReturnValueOnce(okAsync(me));
    h.createHeadersMock.mockReturnValueOnce(
      okAsync({
        headers: () => ({}),
      }),
    );

    const networkError = new Error("network failure");
    h.getTransactionsRequestMock.mockRejectedValueOnce(networkError);

    const res = await getTransactions();

    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalUnavailableError");
    expect(res.error.message).toContain("Fetch me failed");
  });
});
