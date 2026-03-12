import { describe, expect, it } from "vitest";

import { omitUndefined } from "./omit-undefined";

describe("omitUndefined", () => {
  it("removes top-level undefined keys", () => {
    const input = {
      bool: false,
      drop: undefined,
      empty: "",
      nil: null,
      num: 0,
      text: "ok",
    };

    expect(omitUndefined(input)).toEqual({
      bool: false,
      empty: "",
      nil: null,
      num: 0,
      text: "ok",
    });
  });

  it("removes undefined keys recursively for plain objects", () => {
    const input = {
      nested: {
        drop: undefined,
        keep: "value",
        second: {
          drop: undefined,
          keep: 42,
        },
      },
    };

    expect(omitUndefined(input)).toEqual({
      nested: {
        keep: "value",
        second: {
          keep: 42,
        },
      },
    });
  });

  it("does not recurse into arrays", () => {
    const element = {
      drop: undefined,
      keep: "value",
    };
    const items: unknown[] = [element, undefined, 1];
    const input = {
      drop: undefined,
      items,
    };

    const result = omitUndefined(input);

    expect(result).toEqual({ items });
    expect(result.items).toBe(items);
    expect((result.items as unknown[])[0]).toBe(element);
  });

  it("preserves non-plain object values", () => {
    const now = new Date();
    const map = new Map<string, number>([["a", 1]]);
    const set = new Set<number>([1, 2]);
    const fn = () => "ok";

    const result = omitUndefined({
      date: now,
      drop: undefined,
      fn,
      map,
      set,
    });

    expect(result).toEqual({
      date: now,
      fn,
      map,
      set,
    });
    expect(result.date).toBe(now);
    expect(result.map).toBe(map);
    expect(result.set).toBe(set);
    expect(result.fn).toBe(fn);
  });

  it("does not mutate the input object", () => {
    const input = {
      keep: "value",
      nested: {
        drop: undefined as number | undefined,
        keep: 1,
      },
    };

    const result = omitUndefined(input);

    expect(result).toEqual({
      keep: "value",
      nested: {
        keep: 1,
      },
    });
    expect(result).not.toBe(input);
    expect(result.nested).not.toBe(input.nested);
    expect(input).toEqual({
      keep: "value",
      nested: {
        drop: undefined,
        keep: 1,
      },
    });
  });

  it("narrows undefined-containing object properties in the return type", () => {
    const input: {
      drop: number | undefined;
      keep: string;
      nested: {
        maybe?: string | undefined;
        requiredMaybe: number | undefined;
        strict: number;
      };
      readonly roMaybe?: string | undefined;
      readonly roStrict: number;
      values: Array<{ maybe?: string | undefined }>;
    } = {
      drop: undefined,
      keep: "value",
      nested: {
        maybe: undefined,
        requiredMaybe: undefined,
        strict: 1,
      },
      roMaybe: undefined,
      roStrict: 10,
      values: [{ maybe: undefined }],
    };

    const result = omitUndefined(input);

    type Expected = {
      drop?: number;
      keep: string;
      nested: {
        maybe?: string;
        requiredMaybe?: number;
        strict: number;
      };
      readonly roMaybe?: string;
      readonly roStrict: number;
      values: Array<{ maybe?: string | undefined }>;
    };
    const typedResult: Expected = result;
    const reverseTypedResult: typeof result = {} as Expected;

    void typedResult;
    void reverseTypedResult;
    expect(result.keep).toBe("value");
  });
});
