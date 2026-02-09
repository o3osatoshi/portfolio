import { describe, expect, it } from "vitest";

import { newRichError } from "@o3osatoshi/toolkit";

import { applicationErrorI18nKeys } from "./application-error-catalog";
import { ensureApplicationErrorI18n } from "./error-i18n";

describe("application/error-i18n", () => {
  it("keeps existing i18n", () => {
    const error = newRichError({
      code: "DOM_ANY",
      i18n: { key: applicationErrorI18nKeys.INTERNAL },
      isOperational: true,
      kind: "Validation",
      layer: "Domain",
    });

    const enriched = ensureApplicationErrorI18n(error);
    expect(enriched).toBe(error);
    expect(enriched.i18n?.key).toBe(applicationErrorI18nKeys.INTERNAL);
  });

  it("maps domain and zod codes to validation", () => {
    const domainError = newRichError({
      code: "DOM_CURRENCY_CODE_FORMAT_INVALID",
      isOperational: true,
      kind: "Validation",
      layer: "Domain",
    });

    const enriched = ensureApplicationErrorI18n(domainError);
    expect(enriched.i18n?.key).toBe(applicationErrorI18nKeys.VALIDATION);
  });

  it("maps prisma not-found code to not_found", () => {
    const prismaError = newRichError({
      code: "PRISMA_P2025_RECORD_NOT_FOUND",
      isOperational: true,
      kind: "NotFound",
      layer: "Persistence",
    });

    const enriched = ensureApplicationErrorI18n(prismaError);
    expect(enriched.i18n?.key).toBe(applicationErrorI18nKeys.NOT_FOUND);
  });

  it("maps zod code to validation regardless of kind", () => {
    const error = newRichError({
      code: "ZOD_INVALID_TYPE",
      isOperational: true,
      kind: "Internal",
      layer: "Application",
    });

    const enriched = ensureApplicationErrorI18n(error);
    expect(enriched.i18n?.key).toBe(applicationErrorI18nKeys.VALIDATION);
  });

  it("maps integration unavailable code to unavailable", () => {
    const error = newRichError({
      code: "INT_EXCHANGE_RATE_API_HTTP_ERROR",
      isOperational: true,
      kind: "Internal",
      layer: "External",
    });

    const enriched = ensureApplicationErrorI18n(error);
    expect(enriched.i18n?.key).toBe(applicationErrorI18nKeys.UNAVAILABLE);
  });

  it("falls back to kind mapping", () => {
    const error = newRichError({
      isOperational: true,
      kind: "Timeout",
      layer: "Infrastructure",
    });

    const enriched = ensureApplicationErrorI18n(error);
    expect(enriched.i18n?.key).toBe(applicationErrorI18nKeys.TIMEOUT);
  });
});
