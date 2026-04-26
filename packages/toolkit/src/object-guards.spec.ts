import { describe, expect, it } from "vitest";

import { isObjectLike, isPlainObject, isRecord } from "./object-guards";

describe("object-guards", () => {
  it("isObjectLike returns true only for non-null objects", () => {
    expect(isObjectLike({})).toBe(true);
    expect(isObjectLike([])).toBe(true);
    expect(isObjectLike(new Date())).toBe(true);

    expect(isObjectLike(null)).toBe(false);
    expect(isObjectLike("x")).toBe(false);
    expect(isObjectLike(1)).toBe(false);
    expect(isObjectLike(false)).toBe(false);
    expect(isObjectLike(undefined)).toBe(false);
  });

  it("isRecord excludes null and arrays", () => {
    expect(isRecord({ a: 1 })).toBe(true);
    expect(isRecord(Object.create(null))).toBe(true);

    expect(isRecord([])).toBe(false);
    expect(isRecord(null)).toBe(false);
    expect(isRecord("x")).toBe(false);
  });

  it("isPlainObject accepts plain and null-prototype objects", () => {
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
  });

  it("isPlainObject rejects non-plain objects", () => {
    class Custom {
      value = 1;
    }

    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    expect(isPlainObject(new Map())).toBe(false);
    expect(isPlainObject(new Set())).toBe(false);
    expect(isPlainObject(new Custom())).toBe(false);
    expect(isPlainObject(() => "x")).toBe(false);
  });
});
