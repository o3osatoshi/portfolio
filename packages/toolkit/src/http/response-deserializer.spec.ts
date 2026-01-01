import { describe, expect, it } from "vitest";

import {
  deserializeResponseBody,
  isDeserializableResponse,
} from "./response-deserializer";

describe("toolkit response-deserializer", () => {
  describe("isDeserializableResponse", () => {
    it("returns false when response is missing", () => {
      expect(isDeserializableResponse(undefined as unknown as Response)).toBe(
        false,
      );
    });

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

      expect(isDeserializableResponse(res204)).toBe(false);
      expect(isDeserializableResponse(res205)).toBe(false);
      expect(isDeserializableResponse(res304)).toBe(false);
    });

    it("returns false when content-length is zero", () => {
      const res = new Response("{}", {
        headers: {
          "content-length": "0",
          "content-type": "application/json",
        },
        status: 200,
      });

      expect(isDeserializableResponse(res)).toBe(false);
    });

    it("returns false when content-type is missing", () => {
      const res = new Response(null, {
        headers: { "content-type": "" },
        status: 200,
      });

      expect(isDeserializableResponse(res)).toBe(false);
    });

    it("returns false for non-json content types", () => {
      const res = new Response("ok", {
        headers: { "content-type": "text/plain" },
        status: 200,
      });

      expect(isDeserializableResponse(res)).toBe(false);
    });

    it("returns true for json content types", () => {
      const res = new Response("{}", {
        headers: { "content-type": "application/json" },
        status: 200,
      });

      expect(isDeserializableResponse(res)).toBe(true);
    });

    it("returns true for json content types with charset", () => {
      const res = new Response("{}", {
        headers: {
          "content-type": "application/problem+json; charset=utf-8",
        },
        status: 200,
      });

      expect(isDeserializableResponse(res)).toBe(true);
    });

    it("returns true when content-length is invalid", () => {
      const res = new Response("{}", {
        headers: {
          "content-length": "abc",
          "content-type": "application/json",
        },
        status: 200,
      });

      expect(isDeserializableResponse(res)).toBe(true);
    });
  });

  describe("deserializeResponseBody", () => {
    it("returns null when response is not deserializable", async () => {
      const res = new Response("{}", {
        headers: {
          "content-length": "0",
          "content-type": "application/json",
        },
        status: 200,
      });

      await expect(deserializeResponseBody(res)).resolves.toBeNull();
    });

    it("parses JSON payloads when present", async () => {
      const payload = { ok: true };
      const res = new Response(JSON.stringify(payload), {
        headers: { "content-type": "application/json" },
        status: 200,
      });

      await expect(deserializeResponseBody(res)).resolves.toEqual(payload);
    });

    it("returns null for non-json content types", async () => {
      const res = new Response("plain", {
        headers: { "content-type": "text/plain" },
        status: 200,
      });

      await expect(deserializeResponseBody(res)).resolves.toBeNull();
    });

    it("rejects when JSON parsing fails", async () => {
      const res = new Response("not-json", {
        headers: { "content-type": "application/json" },
        status: 200,
      });

      await expect(deserializeResponseBody(res)).rejects.toThrow();
    });
  });
});
