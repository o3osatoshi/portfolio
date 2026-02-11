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
    const t = vi.fn(
      (key: string, values?: Record<string, Date | number | string>) =>
        `${key}:${String(values?.["resource"])}`,
    );

    h.getTranslationsMock.mockResolvedValueOnce(t);

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

    expect(h.getTranslationsMock).toHaveBeenCalledTimes(1);
    expect(h.getTranslationsMock).toHaveBeenCalledWith({ locale: "ja" });
    expect(t).toHaveBeenCalledWith("errors.application.forbidden", {
      resource: "transaction",
    });
    expect(message).toBe("errors.application.forbidden:transaction");
  });

  it("returns Unknown error when i18n is missing and no fallback exists", async () => {
    const t = vi.fn();
    h.getTranslationsMock.mockResolvedValueOnce(t);

    const error: SerializedRichError = {
      name: "ApplicationInternalError",
      isOperational: false,
      kind: "Internal",
      layer: "Application",
      message: "internal details",
    };

    const message = await resolveErrorMessage(error, "en");

    expect(t).not.toHaveBeenCalled();
    expect(message).toBe("Unknown error");
  });

  it("falls back to fallback.i18n when primary translation throws", async () => {
    const t = vi.fn((key: string) => {
      if (key === "errors.application.not_found") {
        throw new Error("translation missing");
      }
      return `translated:${key}`;
    });

    h.getTranslationsMock.mockResolvedValueOnce(t);

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

    const message = await resolveErrorMessage(error, "ja", {
      fallback: {
        i18n: { key: "errors.custom.unknown" },
      },
    });

    expect(t).toHaveBeenNthCalledWith(
      1,
      "errors.application.not_found",
      undefined,
    );
    expect(t).toHaveBeenNthCalledWith(2, "errors.custom.unknown", undefined);
    expect(message).toBe("translated:errors.custom.unknown");
  });

  it("returns fallback.message when both primary and fallback.i18n translations fail", async () => {
    const t = vi.fn(() => {
      throw new Error("translation missing");
    });

    h.getTranslationsMock.mockResolvedValueOnce(t);

    const error: SerializedRichError = {
      name: "ApplicationForbiddenError",
      i18n: {
        key: "errors.application.forbidden",
      },
      isOperational: true,
      kind: "Forbidden",
      layer: "Application",
      message: "forbidden",
    };

    const message = await resolveErrorMessage(error, "ja", {
      fallback: {
        i18n: { key: "errors.custom.unknown" },
        message: "custom:unknown",
      },
    });

    expect(t).toHaveBeenNthCalledWith(
      1,
      "errors.application.forbidden",
      undefined,
    );
    expect(t).toHaveBeenNthCalledWith(2, "errors.custom.unknown", undefined);
    expect(message).toBe("custom:unknown");
  });

  it("returns fallback.message without translation when only message fallback is provided", async () => {
    const t = vi.fn();
    h.getTranslationsMock.mockResolvedValueOnce(t);

    const error: SerializedRichError = {
      name: "ApplicationInternalError",
      isOperational: false,
      kind: "Internal",
      layer: "Application",
      message: "internal details",
    };

    const message = await resolveErrorMessage(error, "en", {
      fallback: {
        message: "custom:unknown",
      },
    });

    expect(t).not.toHaveBeenCalled();
    expect(message).toBe("custom:unknown");
  });
});
