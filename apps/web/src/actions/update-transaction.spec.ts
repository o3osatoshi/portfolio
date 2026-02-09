import { err, errAsync, ok, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    createPrismaClientMock: vi.fn(),
    getLocaleMock: vi.fn(),
    getUserIdMock: vi.fn(),
    parseUpdateTransactionRequestMock: vi.fn(),
    prismaRepoCtorMock: vi.fn(),
    redirectMock: vi.fn(),
    updateTagMock: vi.fn(),
    updateTransactionExecuteMock: vi.fn(),
  };
});

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

vi.mock("@/server/auth", () => ({
  getUserId: h.getUserIdMock,
}));

vi.mock("@repo/application", () => ({
  parseUpdateTransactionRequest: h.parseUpdateTransactionRequestMock,
  UpdateTransactionUseCase: vi.fn(function UpdateTransactionUseCaseMock(this: {
    execute: typeof h.updateTransactionExecuteMock;
  }) {
    this.execute = h.updateTransactionExecuteMock;
  }),
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

import { updateTransaction } from "./update-transaction";

describe("actions/update-transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.getLocaleMock.mockResolvedValue("en");
  });

  it("revalidates transactions tag and redirects on success", async () => {
    const userId = "u1";
    const parsedReq = {
      id: "t1",
      amount: "2.0",
    };

    h.getUserIdMock.mockReturnValueOnce(okAsync(userId));
    h.parseUpdateTransactionRequestMock.mockReturnValueOnce(ok(parsedReq));
    h.updateTransactionExecuteMock.mockReturnValueOnce(okAsync(undefined));

    const formData = new FormData();
    formData.set("id", "t1");
    formData.set("amount", "2.0");

    await updateTransaction(undefined, formData);

    expect(h.getUserIdMock).toHaveBeenCalledTimes(1);
    expect(h.parseUpdateTransactionRequestMock).toHaveBeenCalledTimes(1);
    expect(h.parseUpdateTransactionRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t1",
        amount: "2.0",
      }),
    );
    expect(h.updateTransactionExecuteMock).toHaveBeenCalledWith(
      parsedReq,
      userId,
    );

    const expectedTag = getTag("labs-transactions", { userId });
    expect(h.updateTagMock).toHaveBeenCalledWith(expectedTag);
    const expectedPath = getPath("labs-server-actions-crud");
    expect(h.redirectMock).toHaveBeenCalledWith({
      href: expectedPath,
      locale: "en",
    });
  });

  it("returns ActionState error when getUserId fails", async () => {
    const authError = new Error("not authenticated");
    h.getUserIdMock.mockReturnValueOnce(errAsync(authError));

    const formData = new FormData();

    const state = await updateTransaction(undefined, formData);

    expect(state?.ok).toBe(false);
    if (state?.ok) return;

    expect(state?.error.message).toBe("not authenticated");
    expect(h.parseUpdateTransactionRequestMock).not.toHaveBeenCalled();
    expect(h.updateTransactionExecuteMock).not.toHaveBeenCalled();
    expect(h.updateTagMock).not.toHaveBeenCalled();
    expect(h.redirectMock).not.toHaveBeenCalled();
  });

  it("returns ActionState error when request parsing fails", async () => {
    const userId = "u1";
    const parseError = new Error("invalid payload");

    h.getUserIdMock.mockReturnValueOnce(okAsync(userId));
    h.parseUpdateTransactionRequestMock.mockReturnValueOnce(err(parseError));

    const formData = new FormData();
    formData.set("id", "t1");
    formData.set("amount", "invalid");

    const state = await updateTransaction(undefined, formData);

    expect(state?.ok).toBe(false);
    if (state?.ok) return;

    expect(state?.error.message).toBe("invalid payload");
    expect(state?.error.name).toBe("ExternalInternalError");
    expect(state?.error.kind).toBe("Internal");
    expect(state?.error.layer).toBe("External");
    expect(h.updateTransactionExecuteMock).not.toHaveBeenCalled();
    expect(h.updateTagMock).not.toHaveBeenCalled();
    expect(h.redirectMock).not.toHaveBeenCalled();
  });
});
