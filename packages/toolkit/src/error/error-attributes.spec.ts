import { describe, expect, it } from "vitest";

import {
  coerceErrorMessage,
  extractErrorMessage,
  extractErrorName,
} from "./error-attributes";

describe("error attribute helpers", () => {
  describe("extractErrorMessage", () => {
    it("returns full messages by default (no truncation)", () => {
      const err = new Error("a".repeat(210));
      const message = extractErrorMessage(err);

      expect(message).toBe("a".repeat(210));
    });

    it("does not truncate strings by default", () => {
      const long = "x".repeat(205);
      expect(extractErrorMessage(long)).toBe(long);
      const err = new Error(long);
      expect(extractErrorMessage(err)).toBe(long);
    });

    it("returns strings unchanged by default", () => {
      expect(extractErrorMessage("short message")).toBe("short message");
    });

    it("reads message fields from plain objects", () => {
      const message = extractErrorMessage({ message: "boom" });

      expect(message).toBe("boom");
    });

    it("ignores non-string message fields on plain objects", () => {
      expect(extractErrorMessage({ message: 42 })).toBeUndefined();
    });

    it("returns undefined when the value lacks a message", () => {
      expect(extractErrorMessage({})).toBeUndefined();
      expect(extractErrorMessage(42)).toBeUndefined();
    });
  });

  describe("extractErrorName", () => {
    it("prefers native Error names", () => {
      const err = Object.assign(new Error("nope"), {
        name: "CustomAbortError",
      });

      expect(extractErrorName(err)).toBe("CustomAbortError");
    });

    it("reads name fields from plain objects", () => {
      expect(extractErrorName({ name: "AbortError" })).toBe("AbortError");
    });

    it("ignores non-string name fields on plain objects", () => {
      expect(extractErrorName({ name: 123 })).toBeUndefined();
    });

    it("returns undefined when the value lacks a name", () => {
      expect(extractErrorName("panic")).toBeUndefined();
      expect(extractErrorName(null)).toBeUndefined();
    });
  });

  describe("coerceErrorMessage", () => {
    it("prefers extracted messages when available", () => {
      const err = new Error("boom");
      expect(coerceErrorMessage(err)).toBe("boom");
      expect(coerceErrorMessage("plain")).toBe("plain");
      expect(coerceErrorMessage({ message: "object message" })).toBe(
        "object message",
      );
    });

    it("falls back to JSON or string coercion", () => {
      expect(coerceErrorMessage({ foo: "bar" })).toBe('{"foo":"bar"}');
      expect(coerceErrorMessage(42)).toBe("42");
      expect(coerceErrorMessage(null)).toBe("null");
      expect(coerceErrorMessage(undefined)).toBeUndefined();
    });
  });
});
