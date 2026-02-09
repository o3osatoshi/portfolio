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
    const tCommon = vi.fn((key: string) => `common:${key}`);
    const tError = vi.fn(
      (key: string, values?: Record<string, Date | number | string>) =>
        `${key}:${String(values?.["id"])}`,
    );

    h.useTranslationsMock
      .mockReturnValueOnce(tCommon)
      .mockReturnValueOnce(tError);

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

    expect(h.useTranslationsMock).toHaveBeenNthCalledWith(1, "Common");
    expect(h.useTranslationsMock).toHaveBeenNthCalledWith(2);
    expect(tError).toHaveBeenCalledWith("errors.application.not_found", {
      id: 10,
    });
    expect(message).toBe("errors.application.not_found:10");
  });

  it("falls back to Common.unknownError when i18n is missing", () => {
    const tCommon = vi.fn((key: string) => `common:${key}`);
    const tError = vi.fn();

    h.useTranslationsMock
      .mockReturnValueOnce(tCommon)
      .mockReturnValueOnce(tError);

    const getMessage = useErrorMessage();

    const error: SerializedRichError = {
      name: "ApplicationInternalError",
      isOperational: false,
      kind: "Internal",
      layer: "Application",
      message: "internal details",
    };

    const message = getMessage(error);

    expect(tCommon).toHaveBeenCalledWith("unknownError");
    expect(tError).not.toHaveBeenCalled();
    expect(message).toBe("common:unknownError");
  });

  it("falls back to Common.unknownError when translation throws", () => {
    const tCommon = vi.fn((key: string) => `common:${key}`);
    const tError = vi.fn(() => {
      throw new Error("missing translation");
    });

    h.useTranslationsMock
      .mockReturnValueOnce(tCommon)
      .mockReturnValueOnce(tError);

    const getMessage = useErrorMessage();

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

    expect(tCommon).toHaveBeenCalledWith("unknownError");
    expect(message).toBe("common:unknownError");
  });
});
