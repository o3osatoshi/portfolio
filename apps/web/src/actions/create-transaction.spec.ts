import { err, errAsync, ok, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    createPrismaClientMock: vi.fn(),
    createTransactionExecuteMock: vi.fn(),
    getLocaleMock: vi.fn(),
    getMeMock: vi.fn(),
    parseCreateTransactionRequestMock: vi.fn(),
    prismaRepoCtorMock: vi.fn(),
    redirectMock: vi.fn(),
    updateTagMock: vi.fn(),
  };
});

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

vi.mock("@/services/get-me", () => ({
  getMe: h.getMeMock,
}));

vi.mock("@repo/application", () => ({
  CreateTransactionUseCase: vi.fn(function CreateTransactionUseCaseMock(this: {
    execute: typeof h.createTransactionExecuteMock;
  }) {
    this.execute = h.createTransactionExecuteMock;
  }),
  parseCreateTransactionRequest: h.parseCreateTransactionRequestMock,
}));

vi.mock("@repo/prisma", () => ({
  createPrismaClient: h.createPrismaClientMock,
  PrismaTransactionRepository: vi.fn(function PrismaTransactionRepositoryMock(
    this: { client?: unknown },
    client: unknown,
  ) {
    h.prismaRepoCtorMock(client);
    this.client = client;
  }),
}));

vi.mock("next/cache", () => ({
  updateTag: h.updateTagMock,
}));

vi.mock("@/i18n/navigation", () => ({
  redirect: h.redirectMock,
}));

vi.mock("next-intl/server", () => ({
  getLocale: h.getLocaleMock,
}));

vi.mock("@/env/server", () => ({
  env: {
    DATABASE_URL: "postgres://localhost/test",
  },
}));

import { getPath, getTag } from "@/utils/nav-handler";

import { createTransaction } from "./create-transaction";

describe("actions/create-transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.getLocaleMock.mockResolvedValue("en");
  });

  it("revalidates transactions tag and redirects on success", async () => {
    const me = { id: "u1" };
    const parsedReq = {
      amount: "1.0",
      currency: "USD",
      datetime: new Date(),
      price: "100",
      type: "BUY",
      userId: me.id,
    };
    const created = { id: "t1", userId: me.id };

    h.getMeMock.mockReturnValueOnce(okAsync(me));
    h.parseCreateTransactionRequestMock.mockReturnValueOnce(ok(parsedReq));
    h.createTransactionExecuteMock.mockReturnValueOnce(okAsync(created));

    const formData = new FormData();
    formData.set("amount", "1.0");
    formData.set("currency", "USD");
    formData.set("datetime", new Date().toISOString());
    formData.set("price", "100");
    formData.set("type", "BUY");

    await createTransaction(undefined, formData);

    expect(h.getMeMock).toHaveBeenCalledTimes(1);
    expect(h.parseCreateTransactionRequestMock).toHaveBeenCalledTimes(1);
    expect(h.parseCreateTransactionRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: "1.0",
        currency: "USD",
        userId: me.id,
      }),
    );
    expect(h.createTransactionExecuteMock).toHaveBeenCalledWith(parsedReq);

    const expectedTag = getTag("labs-transactions", { userId: me.id });
    expect(h.updateTagMock).toHaveBeenCalledWith(expectedTag);
    const expectedPath = getPath("labs-server-actions-crud");
    expect(h.redirectMock).toHaveBeenCalledWith({
      href: expectedPath,
      locale: "en",
    });
  });

  it("returns ActionState error when getMe fails", async () => {
    const authError = new Error("not authenticated");
    h.getMeMock.mockReturnValueOnce(errAsync(authError));

    const formData = new FormData();

    const state = await createTransaction(undefined, formData);

    expect(state?.ok).toBe(false);
    if (state?.ok) return;

    expect(state?.error.message).toBe("not authenticated");
    expect(h.parseCreateTransactionRequestMock).not.toHaveBeenCalled();
    expect(h.createTransactionExecuteMock).not.toHaveBeenCalled();
    expect(h.updateTagMock).not.toHaveBeenCalled();
    expect(h.redirectMock).not.toHaveBeenCalled();
  });

  it("returns ActionState error when request parsing fails", async () => {
    const me = { id: "u1" };
    const parseError = new Error("invalid payload");

    h.getMeMock.mockReturnValueOnce(okAsync(me));
    h.parseCreateTransactionRequestMock.mockReturnValueOnce(err(parseError));

    const formData = new FormData();
    formData.set("amount", "invalid");

    const state = await createTransaction(undefined, formData);

    expect(state?.ok).toBe(false);
    if (state?.ok) return;

    expect(state?.error.message).toBe("invalid payload");
    expect(state?.error.name).toBe("Error");
    expect(h.createTransactionExecuteMock).not.toHaveBeenCalled();
    expect(h.updateTagMock).not.toHaveBeenCalled();
    expect(h.redirectMock).not.toHaveBeenCalled();
  });
});
