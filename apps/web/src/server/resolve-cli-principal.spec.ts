import { okAsync } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => {
  const guardFn = vi.fn(() => okAsync(undefined));
  const loggerWarnMock = vi.fn();
  let guardOptions:
    | {
        buildRateLimitedError: (ctx: {
          decision: {
            limit: number;
            remaining: number;
            resetEpochSeconds: number;
          };
          rule: { id: string };
        }) => { code?: string; kind?: string; meta?: Record<string, unknown> };
        failureMode: "fail-closed" | "fail-open";
        onBypass: (ctx: {
          error: { code?: string };
          input: { issuer: string; subject: string };
          rule: { id: string };
        }) => void;
        rules: Array<{
          id: string;
          limit: number;
          resolveIdentifier: (input: {
            issuer: string;
            subject: string;
          }) => string;
          windowSeconds: number;
        }>;
      }
    | undefined;
  const resolverFn = vi.fn(() =>
    okAsync({
      issuer: "https://example.auth0.com",
      scopes: ["transactions:read"],
      subject: "auth0|123",
      userId: "u-1",
    }),
  );
  return {
    createCliPrincipalResolverMock: vi.fn(() => resolverFn),
    createPrismaClientMock: vi.fn(() => ({ client: true })),
    createRateLimitGuardMock: vi.fn((options: unknown) => {
      guardOptions = options as typeof guardOptions;
      return guardFn;
    }),
    createUpstashRateLimitStoreMock: vi.fn(() => ({ consume: vi.fn() })),
    getGuardOptions: () => guardOptions,
    getWebNodeLoggerMock: vi.fn(() => ({ warn: loggerWarnMock })),
    guardFn,
    loggerWarnMock,
    prismaFindMock: vi.fn(() => okAsync("u-1")),
    prismaResolveMock: vi.fn(() => okAsync("u-1")),
    resetGuardOptions: () => {
      guardOptions = undefined;
    },
    resolverFn,
  };
});

vi.mock("@repo/auth", () => ({
  createCliPrincipalResolver: h.createCliPrincipalResolverMock,
}));

vi.mock("@repo/integrations", () => ({
  createUpstashRateLimitStore: h.createUpstashRateLimitStoreMock,
}));

vi.mock("@repo/prisma", () => ({
  createPrismaClient: h.createPrismaClientMock,
  PrismaUserIdentityStore: vi.fn(function PrismaUserIdentityStoreMock(this: {
    findUserIdByIssuerSubject: typeof h.prismaFindMock;
    resolveUserId: typeof h.prismaResolveMock;
  }) {
    this.findUserIdByIssuerSubject = h.prismaFindMock;
    this.resolveUserId = h.prismaResolveMock;
  }),
}));

vi.mock("@o3osatoshi/toolkit", async () => {
  const actual = await vi.importActual("@o3osatoshi/toolkit");
  return {
    ...actual,
    createRateLimitGuard: h.createRateLimitGuardMock,
  };
});

vi.mock("@/env/server", () => ({
  env: {
    AUTH_CLI_IDENTITY_ISSUER_LIMIT_PER_MINUTE: 77,
    AUTH_CLI_IDENTITY_SUBJECT_COOLDOWN_SECONDS: 333,
    AUTH_OIDC_AUDIENCE: "https://api.o3o.app",
    AUTH_OIDC_ISSUER: "https://example.auth0.com",
    DATABASE_URL: "postgresql://localhost/test",
    UPSTASH_REDIS_REST_TOKEN: "upstash-token",
    UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
  },
}));

vi.mock("@/lib/logger/node", () => ({
  getWebNodeLogger: h.getWebNodeLoggerMock,
}));

describe("server/resolve-cli-principal", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    h.resetGuardOptions();
  });

  it("wires resolver and delegates resolveCliPrincipal calls", async () => {
    const mod = await import("./resolve-cli-principal");

    const result = await mod.resolveCliPrincipal({ accessToken: "token" });

    expect(result.isOk()).toBe(true);
    expect(h.createPrismaClientMock).toHaveBeenCalledWith({
      connectionString: "postgresql://localhost/test",
    });
    expect(h.createUpstashRateLimitStoreMock).toHaveBeenCalledWith({
      token: "upstash-token",
      url: "https://example.upstash.io",
    });
    expect(h.createCliPrincipalResolverMock).toHaveBeenCalledWith(
      expect.objectContaining({
        audience: "https://api.o3o.app",
        checkIdentityProvisioningRateLimit: expect.any(Function),
        issuer: "https://example.auth0.com",
      }),
    );
    expect(h.resolverFn).toHaveBeenCalledWith({ accessToken: "token" });
  });

  it("configures balanced rules with subject-first evaluation", async () => {
    await import("./resolve-cli-principal");

    expect(h.createRateLimitGuardMock).toHaveBeenCalledTimes(1);
    const options = h.getGuardOptions();
    expect(options?.failureMode).toBe("fail-open");
    expect(options?.rules.map((rule) => rule.id)).toEqual([
      "cli-identity-subject",
      "cli-identity-issuer",
    ]);
    expect(options?.rules[0]).toMatchObject({
      id: "cli-identity-subject",
      limit: 1,
      windowSeconds: 333,
    });
    expect(options?.rules[1]).toMatchObject({
      id: "cli-identity-issuer",
      limit: 77,
      windowSeconds: 60,
    });
    expect(
      options?.rules[0]?.resolveIdentifier({
        issuer: "https://example.auth0.com",
        subject: "auth0|sub",
      }),
    ).toBe("https://example.auth0.com:auth0|sub");
  });

  it("builds rate-limit error and logs bypass with subject hash", async () => {
    await import("./resolve-cli-principal");
    const options = h.getGuardOptions();
    expect(options).toBeDefined();
    if (!options) return;

    const rateLimitError = options.buildRateLimitedError({
      decision: {
        limit: 1,
        remaining: 0,
        resetEpochSeconds: 1700000000,
      },
      rule: { id: "cli-identity-subject" },
    });
    expect(rateLimitError.code).toBe("CLI_IDENTITY_RATE_LIMITED");
    expect(rateLimitError.kind).toBe("RateLimit");
    expect(rateLimitError.meta).toMatchObject({
      limit: 1,
      remaining: 0,
      resetEpochSeconds: 1700000000,
      ruleId: "cli-identity-subject",
    });

    options.onBypass({
      error: { code: "INT_RATE_LIMIT_CHECK_FAILED" },
      input: { issuer: "https://example.auth0.com", subject: "auth0|sub" },
      rule: { id: "cli-identity-subject" },
    });

    expect(h.loggerWarnMock).toHaveBeenCalledWith(
      "cli_identity_rate_limit_bypassed",
      expect.objectContaining({
        errorCode: "INT_RATE_LIMIT_CHECK_FAILED",
        issuer: "https://example.auth0.com",
        ruleId: "cli-identity-subject",
        subjectHash: expect.any(String),
      }),
    );
    const warnPayload = h.loggerWarnMock.mock.calls[0]?.[1] as
      | { subjectHash?: string }
      | undefined;
    expect(warnPayload?.subjectHash).toHaveLength(16);
    expect(warnPayload?.subjectHash).not.toBe("auth0|sub");
  });
});
