import { err, errAsync, ok, okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    createPrismaClientMock: vi.fn(),
    deleteTransactionExecuteMock: vi.fn(),
    getLocaleMock: vi.fn(),
    getUserIdMock: vi.fn(),
    parseDeleteTransactionRequestMock: vi.fn(),
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

vi.mock("@/server/auth", () => ({
  getUserId: h.getUserIdMock,
}));

vi.mock("@repo/application", () => ({
  DeleteTransactionUseCase: vi.fn(function DeleteTransactionUseCaseMock(this: {
    execute: typeof h.deleteTransactionExecuteMock;
  }) {
    this.execute = h.deleteTransactionExecuteMock;
  }),
  parseDeleteTransactionRequest: h.parseDeleteTransactionRequestMock,
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

import { deleteTransaction } from "./delete-transaction";

describe("actions/delete-transaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    h.getLocaleMock.mockResolvedValue("en");
  });

  it("revalidates transactions tag and redirects on success", async () => {
    const userId = "u1";
    const parsedReq = {
      id: "t1",
      userId,
    };

    h.getUserIdMock.mockReturnValueOnce(okAsync(userId));
    h.parseDeleteTransactionRequestMock.mockReturnValueOnce(ok(parsedReq));
    h.deleteTransactionExecuteMock.mockReturnValueOnce(okAsync(undefined));

    const formData = new FormData();
    formData.set("id", "t1");

    await deleteTransaction(undefined, formData);

    expect(h.getUserIdMock).toHaveBeenCalledTimes(1);
    expect(h.parseDeleteTransactionRequestMock).toHaveBeenCalledTimes(1);
    expect(h.parseDeleteTransactionRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "t1",
        userId,
      }),
    );
    expect(h.deleteTransactionExecuteMock).toHaveBeenCalledWith(parsedReq);

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

    const state = await deleteTransaction(undefined, formData);

    expect(state?.ok).toBe(false);
    if (state?.ok) return;

    expect(state?.error.message).toBe("not authenticated");
    expect(h.parseDeleteTransactionRequestMock).not.toHaveBeenCalled();
    expect(h.deleteTransactionExecuteMock).not.toHaveBeenCalled();
    expect(h.updateTagMock).not.toHaveBeenCalled();
    expect(h.redirectMock).not.toHaveBeenCalled();
  });

  it("returns ActionState error when request parsing fails", async () => {
    const userId = "u1";
    const parseError = new Error("invalid payload");

    h.getUserIdMock.mockReturnValueOnce(okAsync(userId));
    h.parseDeleteTransactionRequestMock.mockReturnValueOnce(err(parseError));

    const formData = new FormData();
    formData.set("id", "t1");

    const state = await deleteTransaction(undefined, formData);

    expect(state?.ok).toBe(false);
    if (state?.ok) return;

    expect(state?.error.message).toBe("invalid payload");
    expect(state?.error.name).toBe("Error");
    expect(h.deleteTransactionExecuteMock).not.toHaveBeenCalled();
    expect(h.updateTagMock).not.toHaveBeenCalled();
    expect(h.redirectMock).not.toHaveBeenCalled();
  });
});
