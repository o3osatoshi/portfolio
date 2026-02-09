import { describe, expect, it, vi } from "vitest";

import { handleResponse } from "./handle-response";

describe("utils/handle-response", () => {
  it("returns Err Unauthorized when status is 401", async () => {
    const res = {
      json: vi.fn(),
      ok: false,
      status: 401,
    } as unknown as Response;

    const result = await handleResponse<unknown>(res, {
      context: "getMe",
      request: { method: "GET", url: "/edge/private/me" },
    });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.name).toBe("ExternalUnauthorizedError");
  });

  it("returns Err Serialization when remote payload is not serialized RichError", async () => {
    const body = { name: "ApplicationNotFoundError", message: "not found" };
    const res = {
      json: vi.fn().mockResolvedValueOnce(body),
      ok: false,
      status: 404,
    } as unknown as Response;

    const result = await handleResponse<unknown>(res, {
      context: "getTransactions",
      request: { method: "GET", url: "/api/private/labs/transactions" },
    });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.name).toBe("ExternalSerializationError");
    expect(result.error.message).toContain("DeserializeExternalApiErrorBody");
  });

  it("returns Ok with parsed body when response is successful", async () => {
    const body = { id: "u1", name: "Alice" };
    const res = {
      json: vi.fn().mockResolvedValueOnce(body),
      ok: true,
      status: 200,
    } as unknown as Response;

    const result = await handleResponse<typeof body>(res, {
      context: "getMe",
      request: { method: "GET", url: "/edge/private/me" },
    });

    expect(result.isOk()).toBe(true);
    if (!result.isOk()) return;

    expect(result.value).toEqual(body);
  });

  it("returns Err when JSON parse fails on success status", async () => {
    const jsonError = new Error("invalid json");
    const res = {
      json: vi.fn().mockRejectedValueOnce(jsonError),
      ok: true,
      status: 200,
    } as unknown as Response;

    const result = await handleResponse<unknown>(res, {
      context: "getMe",
      request: { method: "GET", url: "/edge/private/me" },
    });

    expect(result.isErr()).toBe(true);
    if (!result.isErr()) return;

    expect(result.error).toBeInstanceOf(Error);
    expect(result.error.name).toBe("ExternalSerializationError");
  });
});
