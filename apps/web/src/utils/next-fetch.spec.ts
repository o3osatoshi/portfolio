import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  return {
    fetchMock: vi.fn(),
  };
});

vi.mock("@/env/client", () => ({
  env: {
    NEXT_PUBLIC_API_BASE_URL: "https://example.com",
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: "proj-123",
  },
}));

import { getQueryPath, nextFetch } from "./next-fetch";

describe("utils/next-fetch getQueryPath", () => {
  it("returns path when search is undefined", () => {
    expect(getQueryPath("/external", undefined)).toBe("/external");
  });

  it("appends query string for object search", () => {
    const path = getQueryPath("/external", { page: "1", q: "foo" });
    const url = new URL(path, "https://example.com");

    expect(url.pathname).toBe("/external");
    expect(url.searchParams.get("q")).toBe("foo");
    expect(url.searchParams.get("page")).toBe("1");
  });

  it("appends query string for URLSearchParams", () => {
    const params = new URLSearchParams([
      ["q", "bar"],
      ["page", "2"],
    ]);
    const path = getQueryPath("/external", params);
    expect(path).toBe("/external?q=bar&page=2");
  });
});

describe("utils/next-fetch nextFetch", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    h.fetchMock.mockReset();
    global.fetch = h.fetchMock;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("performs fetch with composed URL and returns parsed body", async () => {
    const body = { ok: true };
    h.fetchMock.mockResolvedValueOnce({
      headers: {
        get: (name: string) =>
          name.toLowerCase() === "content-type" ? "application/json" : null,
      },
      json: vi.fn().mockResolvedValueOnce(body),
      ok: true,
      redirected: false,
      status: 200,
      statusText: "OK",
      url: "https://example.com/external",
    } as unknown as Response);

    const res = await nextFetch({
      path: "/external",
    });

    expect(h.fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = h.fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toBe("https://example.com/external");
    expect(init.next?.tags).toEqual(["/external"]);

    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;

    expect(res.value.body).toEqual(body);
    expect(res.value.status).toBe(200);
    expect(res.value.url).toBe("https://example.com/external");
  });

  it("includes search, cache, revalidate and tags in fetch options", async () => {
    const body = { ok: true };
    h.fetchMock.mockResolvedValueOnce({
      headers: {
        get: (name: string) =>
          name.toLowerCase() === "content-type" ? "application/json" : null,
      },
      json: vi.fn().mockResolvedValueOnce(body),
      ok: true,
      redirected: false,
      status: 200,
      statusText: "OK",
      url: "https://example.com/external?q=foo&page=1",
    } as unknown as Response);

    const res = await nextFetch({
      revalidate: 60,
      cache: "no-store",
      path: "/external",
      search: { page: "1", q: "foo" },
      tags: ["custom"],
    });

    expect(h.fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = h.fetchMock.mock.calls[0] as [URL, RequestInit];
    const parsed = new URL(url.toString());

    expect(parsed.pathname).toBe("/external");
    expect(parsed.searchParams.get("q")).toBe("foo");
    expect(parsed.searchParams.get("page")).toBe("1");

    expect(init.cache).toBe("no-store");
    expect(init.next?.revalidate).toBe(60);

    const tags = init.next?.tags ?? [];
    const queryPath = parsed.pathname + parsed.search;
    expect(tags).toContain("custom");
    expect(tags).toContain(queryPath);

    expect(res.isOk()).toBe(true);
    if (!res.isOk()) return;

    expect(res.value.body).toEqual(body);
  });

  it("returns Err when fetch rejects with network error", async () => {
    h.fetchMock.mockRejectedValueOnce(new Error("network failure"));

    const res = await nextFetch({
      path: "/external",
    });

    expect(h.fetchMock).toHaveBeenCalledTimes(1);
    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalUnavailableError");
    const payload = JSON.parse(res.error.message);
    expect(payload.summary).toBe("Fetch /external failed");
  });

  it("returns Err when response body JSON parse fails", async () => {
    h.fetchMock.mockResolvedValueOnce({
      headers: {
        get: (name: string) =>
          name.toLowerCase() === "content-type" ? "application/json" : null,
      },
      json: vi.fn().mockRejectedValueOnce(new Error("invalid json")),
      ok: true,
      redirected: false,
      status: 200,
      statusText: "OK",
      url: "https://example.com/external",
    } as unknown as Response);

    const res = await nextFetch({
      path: "/external",
    });

    expect(h.fetchMock).toHaveBeenCalledTimes(1);
    expect(res.isErr()).toBe(true);
    if (!res.isErr()) return;

    expect(res.error).toBeInstanceOf(Error);
    expect(res.error.name).toBe("ExternalSerializationError");
    const payload = JSON.parse(res.error.message);
    expect(payload.summary).toBe("Deserialize body for /external failed");
  });
});
