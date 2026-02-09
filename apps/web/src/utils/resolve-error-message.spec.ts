import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    getTranslationsMock: vi.fn(),
  };
});

vi.mock("next-intl/server", () => ({
  getTranslations: h.getTranslationsMock,
}));

import type { SerializedRichError } from "@o3osatoshi/toolkit";

import { resolveErrorMessage } from "./resolve-error-message";

describe("utils/resolve-error-message", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns translated message when i18n key exists", async () => {
    const tCommon = vi.fn((key: string) => `common:${key}`);
    const tError = vi.fn(
      (key: string, values?: Record<string, Date | number | string>) =>
        `${key}:${String(values?.["resource"])}`,
    );

    h.getTranslationsMock
      .mockResolvedValueOnce(tCommon)
      .mockResolvedValueOnce(tError);

    const error: SerializedRichError = {
      name: "ApplicationForbiddenError",
      i18n: {
        key: "errors.application.forbidden",
        params: { resource: "transaction" },
      },
      isOperational: true,
      kind: "Forbidden",
      layer: "Application",
      message: "fallback",
    };

    const message = await resolveErrorMessage(error, "ja");

    expect(h.getTranslationsMock).toHaveBeenNthCalledWith(1, {
      namespace: "Common",
      locale: "ja",
    });
    expect(h.getTranslationsMock).toHaveBeenNthCalledWith(2, {
      locale: "ja",
    });
    expect(tError).toHaveBeenCalledWith("errors.application.forbidden", {
      resource: "transaction",
    });
    expect(message).toBe("errors.application.forbidden:transaction");
  });

  it("falls back to Common.unknownError when i18n is missing", async () => {
    const tCommon = vi.fn((key: string) => `common:${key}`);
    const tError = vi.fn();

    h.getTranslationsMock
      .mockResolvedValueOnce(tCommon)
      .mockResolvedValueOnce(tError);

    const error: SerializedRichError = {
      name: "ApplicationInternalError",
      isOperational: false,
      kind: "Internal",
      layer: "Application",
      message: "internal details",
    };

    const message = await resolveErrorMessage(error, "en");

    expect(tCommon).toHaveBeenCalledWith("unknownError");
    expect(tError).not.toHaveBeenCalled();
    expect(message).toBe("common:unknownError");
  });

  it("falls back to Common.unknownError when translation throws", async () => {
    const tCommon = vi.fn((key: string) => `common:${key}`);
    const tError = vi.fn(() => {
      throw new Error("translation missing");
    });

    h.getTranslationsMock
      .mockResolvedValueOnce(tCommon)
      .mockResolvedValueOnce(tError);

    const error: SerializedRichError = {
      name: "ApplicationNotFoundError",
      i18n: {
        key: "errors.application.not_found",
      },
      isOperational: true,
      kind: "NotFound",
      layer: "Application",
      message: "not found",
    };

    const message = await resolveErrorMessage(error, "ja");

    expect(tCommon).toHaveBeenCalledWith("unknownError");
    expect(message).toBe("common:unknownError");
  });
});
