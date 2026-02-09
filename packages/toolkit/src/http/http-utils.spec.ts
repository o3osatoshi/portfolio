import { describe, expect, it } from "vitest";

import {
  createUrlRedactor,
  formatHttpStatusReason,
  formatPayloadPreview,
  httpStatusToKind,
  isDeserializableBody,
  normalizeBaseUrl,
} from "./http-utils";

describe("toolkit http-utils", () => {
  describe("normalizeBaseUrl", () => {
    it("adds a trailing slash when missing", () => {
      expect(normalizeBaseUrl("https://api.example.com")).toBe(
        "https://api.example.com/",
      );
    });

    it("keeps an existing trailing slash", () => {
      expect(normalizeBaseUrl("https://api.example.com/")).toBe(
        "https://api.example.com/",
      );
    });
  });

  describe("formatPayloadPreview", () => {
    it("formats null and undefined payloads", () => {
      expect(formatPayloadPreview(null)).toBe("null");
      expect(formatPayloadPreview(undefined)).toBe("");
    });

    it("returns strings unchanged", () => {
      expect(formatPayloadPreview("payload")).toBe("payload");
    });

    it("stringifies JSON payloads", () => {
      expect(formatPayloadPreview({ ok: true })).toBe('{"ok":true}');
    });

    it("falls back to String for non-serializable payloads", () => {
      const payload: Record<string, unknown> = {};
      // @ts-expect-error
      payload.self = payload;
      expect(formatPayloadPreview(payload)).toBe("[object Object]");
    });
  });

  describe("formatHttpStatusReason", () => {
    it("includes the service name and status", () => {
      const reason = formatHttpStatusReason({
        payload: undefined,
        response: { status: 404, statusText: "Not Found" },
        serviceName: "Service",
      });

      expect(reason).toBe("Service responded with 404 Not Found");
    });

    it("adds a truncated payload preview when available", () => {
      const reason = formatHttpStatusReason({
        maxPayloadLength: 4,
        payload: "abcdef",
        response: { status: 502, statusText: "Bad Gateway" },
        serviceName: "Service",
      });
      const ellipsis = "\u2026";

      expect(reason).toBe(
        `Service responded with 502 Bad Gateway: abcd${ellipsis}`,
      );
    });
  });

  describe("httpStatusToKind", () => {
    it("maps specific status codes", () => {
      expect(httpStatusToKind(401)).toBe("Unauthorized");
      expect(httpStatusToKind(403)).toBe("Forbidden");
      expect(httpStatusToKind(404)).toBe("NotFound");
      expect(httpStatusToKind(408)).toBe("Timeout");
      expect(httpStatusToKind(429)).toBe("RateLimit");
    });

    it("maps status code ranges", () => {
      expect(httpStatusToKind(400)).toBe("BadRequest");
      expect(httpStatusToKind(499)).toBe("BadRequest");
      expect(httpStatusToKind(500)).toBe("BadGateway");
      expect(httpStatusToKind(599)).toBe("BadGateway");
      expect(httpStatusToKind(200)).toBe("Internal");
    });
  });

  describe("createUrlRedactor", () => {
    it("returns identity when no secrets are provided", () => {
      const redact = createUrlRedactor({ secrets: [undefined] });
      expect(redact("https://example.com/token")).toBe(
        "https://example.com/token",
      );
    });

    it("redacts secrets with the default placeholder", () => {
      const redact = createUrlRedactor({ secrets: ["secret"] });
      const url = "https://example.com/secret?token=secret";

      expect(redact(url)).toBe(
        "https://example.com/<redacted>?token=<redacted>",
      );
    });

    it("supports custom placeholders and multiple secrets", () => {
      const redact = createUrlRedactor({
        placeholder: "[redacted]",
        secrets: ["alpha", "beta"],
      });

      expect(redact("https://example.com/alpha/beta")).toBe(
        "https://example.com/[redacted]/[redacted]",
      );
    });
  });

  describe("isDeserializableBody", () => {
    it("returns false for no-content status codes", () => {
      const res204 = new Response(null, {
        headers: { "content-type": "application/json" },
        status: 204,
      });
      const res205 = new Response(null, {
        headers: { "content-type": "application/json" },
        status: 205,
      });
      const res304 = new Response(null, {
        headers: { "content-type": "application/json" },
        status: 304,
      });

      expect(isDeserializableBody(res204)).toBe(false);
      expect(isDeserializableBody(res205)).toBe(false);
      expect(isDeserializableBody(res304)).toBe(false);
    });

    it("returns false when content-length is zero", () => {
      const res = new Response("{}", {
        headers: {
          "content-length": "0",
          "content-type": "application/json",
        },
        status: 200,
      });

      expect(isDeserializableBody(res)).toBe(false);
    });

    it("returns false when content-type is missing", () => {
      const res = new Response("{}", {
        headers: { "content-type": "" },
        status: 200,
      });

      expect(isDeserializableBody(res)).toBe(false);
    });

    it("returns true when content-type is present and length is non-zero", () => {
      const res = new Response("{}", {
        headers: { "content-type": "application/json" },
        status: 200,
      });

      expect(isDeserializableBody(res)).toBe(true);
    });

    it("returns true when content-length is invalid", () => {
      const res = new Response("{}", {
        headers: {
          "content-length": "abc",
          "content-type": "application/json",
        },
        status: 200,
      });

      expect(isDeserializableBody(res)).toBe(true);
    });
  });
});
