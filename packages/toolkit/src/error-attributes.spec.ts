import { describe, expect, it } from "vitest";

import { extractErrorMessage, extractErrorName } from "./error-attributes";

describe("error attribute helpers", () => {
  describe("extractErrorMessage", () => {
    it("returns truncated messages from Error instances", () => {
      const err = new Error("a".repeat(210));
      const message = extractErrorMessage(err);

      expect(message).toBe(`${"a".repeat(200)}…`);
    });

    it("returns strings unchanged and truncated when the cause is a string", () => {
      expect(extractErrorMessage("short message")).toBe("short message");
      expect(extractErrorMessage("x".repeat(205))).toBe(`${"x".repeat(200)}…`);
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
});
