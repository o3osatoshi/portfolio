import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const EdgeRedisMock = vi.fn(function EdgeRedisMock(
    this: { options: unknown; tag: string },
    options: unknown,
  ) {
    this.options = options;
    this.tag = "edge-redis";
  });
  return { EdgeRedisMock };
});

vi.mock("@upstash/redis/cloudflare", () => ({
  Redis: h.EdgeRedisMock,
}));

import { createEdgeUpstashRedis } from "./redis-edge";

describe("integrations/upstash createEdgeUpstashRedis (edge)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an Edge Redis client with provided token and url", () => {
    createEdgeUpstashRedis({
      token: "edge-token-123",
      url: "https://edge-example.upstash.io",
    });

    expect(h.EdgeRedisMock).toHaveBeenCalledTimes(1);
    expect(h.EdgeRedisMock).toHaveBeenCalledWith({
      token: "edge-token-123",
      url: "https://edge-example.upstash.io",
    });
  });

  it("passes undefined token and url when config is omitted", () => {
    createEdgeUpstashRedis();

    expect(h.EdgeRedisMock).toHaveBeenCalledTimes(1);
    expect(h.EdgeRedisMock).toHaveBeenCalledWith({
      token: undefined,
      url: undefined,
    });
  });
});
