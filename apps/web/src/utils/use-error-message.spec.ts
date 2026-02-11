import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    useTranslationsMock: vi.fn(),
  };
});

vi.mock("next-intl", () => ({
  useTranslations: h.useTranslationsMock,
}));

vi.mock("react", async () => {
  const actual = await vi.importActual<typeof import("react")>("react");
  return {
    ...actual,
    useCallback: <T extends (...args: never[]) => unknown>(fn: T) => fn,
  };
});

import type { SerializedRichError } from "@o3osatoshi/toolkit";

import { useErrorMessage } from "./use-error-message";

describe("utils/use-error-message", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns formatter that resolves i18n message", () => {
    const t = vi.fn(
      (key: string, values?: Record<string, Date | number | string>) =>
        `${key}:${String(values?.["id"])}`,
    );

    h.useTranslationsMock.mockReturnValueOnce(t);

    const getMessage = useErrorMessage();

    const error: SerializedRichError = {
      name: "ApplicationNotFoundError",
      i18n: {
        key: "errors.application.not_found",
        params: { id: 10 },
      },
      isOperational: true,
      kind: "NotFound",
      layer: "Application",
      message: "missing",
    };

    const message = getMessage(error);

    expect(h.useTranslationsMock).toHaveBeenCalledTimes(1);
    expect(h.useTranslationsMock).toHaveBeenCalledWith();
    expect(t).toHaveBeenCalledWith("errors.application.not_found", {
      id: 10,
    });
    expect(message).toBe("errors.application.not_found:10");
  });

  it("returns Unknown error when i18n is missing and no fallback exists", () => {
    const t = vi.fn();
    h.useTranslationsMock.mockReturnValueOnce(t);

    const getMessage = useErrorMessage();

    const error: SerializedRichError = {
      name: "ApplicationInternalError",
      isOperational: false,
      kind: "Internal",
      layer: "Application",
      message: "internal details",
    };

    const message = getMessage(error);

    expect(t).not.toHaveBeenCalled();
    expect(message).toBe("Unknown error");
  });

  it("falls back to fallback.i18n when primary translation throws", () => {
    const t = vi.fn((key: string) => {
      if (key === "errors.application.forbidden") {
        throw new Error("missing translation");
      }
      return `translated:${key}`;
    });

    h.useTranslationsMock.mockReturnValueOnce(t);

    const getMessage = useErrorMessage({
      fallback: {
        i18n: { key: "errors.custom.unknown" },
      },
    });

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

    const message = getMessage(error);

    expect(t).toHaveBeenNthCalledWith(
      1,
      "errors.application.forbidden",
      undefined,
    );
    expect(t).toHaveBeenNthCalledWith(2, "errors.custom.unknown", undefined);
    expect(message).toBe("translated:errors.custom.unknown");
  });

  it("returns fallback.message when both primary and fallback.i18n translations fail", () => {
    const t = vi.fn(() => {
      throw new Error("missing translation");
    });

    h.useTranslationsMock.mockReturnValueOnce(t);

    const getMessage = useErrorMessage({
      fallback: {
        i18n: { key: "errors.custom.unknown" },
        message: "custom:unknown",
      },
    });

    const error: SerializedRichError = {
      name: "ApplicationForbiddenError",
      i18n: {
        key: "errors.application.internal",
      },
      isOperational: true,
      kind: "Forbidden",
      layer: "Application",
      message: "forbidden",
    };

    const message = getMessage(error);

    expect(t).toHaveBeenNthCalledWith(
      1,
      "errors.application.internal",
      undefined,
    );
    expect(t).toHaveBeenNthCalledWith(2, "errors.custom.unknown", undefined);
    expect(message).toBe("custom:unknown");
  });

  it("returns fallback.message without translation when only message fallback is provided", () => {
    const t = vi.fn();
    h.useTranslationsMock.mockReturnValueOnce(t);

    const getMessage = useErrorMessage({
      fallback: {
        message: "custom:unknown",
      },
    });

    const error: SerializedRichError = {
      name: "ApplicationInternalError",
      isOperational: false,
      kind: "Internal",
      layer: "Application",
      message: "internal details",
    };

    const message = getMessage(error);

    expect(t).not.toHaveBeenCalled();
    expect(message).toBe("custom:unknown");
  });
});
