import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { MockApiServer } from "./helpers/mock-api-server";
import { MockOidcServer } from "./helpers/mock-oidc-server";
import { parseJsonFromStdout, runCli } from "./helpers/run-cli";

const cliPackageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");

type JsonErrorEnvelope = {
  error: {
    code?: string | undefined;
    message: string;
  };
  meta: {
    schemaVersion: string;
  };
  ok: false;
};

type JsonSuccessEnvelope = {
  command: string;
  data?: unknown;
  message?: string;
  meta: {
    schemaVersion: string;
  };
  ok: true;
};

describe("CLI E2E (mock OIDC/API)", () => {
  const tempHomes: string[] = [];
  const oidc = new MockOidcServer();
  const api = new MockApiServer({
    resolveAccessToken: (token) => oidc.resolveAccessToken(token),
  });

  beforeAll(async () => {
    await oidc.start();
    await api.start();
  });

  beforeEach(() => {
    oidc.reset();
    api.reset();
  });

  afterAll(async () => {
    await api.stop();
    await oidc.stop();
    await Promise.all(
      tempHomes.map((homePath) =>
        rm(homePath, { force: true, recursive: true }),
      ),
    );
  });

  it("runs hello/auth/tx CRUD/logout flow via subprocess", async () => {
    const env = await createCliEnv(oidc.issuer, api.baseUrl, tempHomes);

    const hello = await runCli({
      args: ["--output", "json", "hello"],
      cwd: cliPackageDir,
      env,
    });
    expect(hello.exitCode).toBe(0);
    expectJsonSuccess(hello.stdout, "hello");

    const login = await runCli({
      args: ["--output", "json", "auth", "login", "--device"],
      cwd: cliPackageDir,
      env,
    });
    expect(login.exitCode).toBe(0);
    expectJsonSuccess(login.stdout, "auth.login");
    expect(login.stderr).toContain("Open this URL to continue login:");

    const whoami = await runCli({
      args: ["--output", "json", "auth", "whoami"],
      cwd: cliPackageDir,
      env,
    });
    expect(whoami.exitCode).toBe(0);
    const whoamiPayload = expectJsonSuccess(whoami.stdout, "auth.whoami");
    expect(whoamiPayload.data).toMatchObject({
      issuer: oidc.issuer,
      userId: "user-e2e-1",
    });

    const initialList = await runCli({
      args: ["--output", "json", "tx", "list"],
      cwd: cliPackageDir,
      env,
    });
    expect(initialList.exitCode).toBe(0);
    const initialListPayload = expectJsonSuccess(initialList.stdout, "tx.list");
    expect(initialListPayload.data).toEqual([]);

    const create = await runCli({
      args: [
        "--output",
        "json",
        "tx",
        "create",
        "--type",
        "BUY",
        "--datetime",
        "2026-01-01T00:00:00.000Z",
        "--amount",
        "1",
        "--price",
        "100",
        "--currency",
        "USD",
      ],
      cwd: cliPackageDir,
      env,
    });
    expect(create.exitCode).toBe(0);
    const createdPayload = expectJsonSuccess(create.stdout, "tx.create");
    const created = createdPayload.data as { id: string };
    expect(created.id).toMatch(/^tx-/);

    const listAfterCreate = await runCli({
      args: ["--output", "json", "tx", "list"],
      cwd: cliPackageDir,
      env,
    });
    expect(listAfterCreate.exitCode).toBe(0);
    const listAfterCreatePayload = expectJsonSuccess(
      listAfterCreate.stdout,
      "tx.list",
    );
    const rows = listAfterCreatePayload.data as Array<{ id: string }>;
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(created.id);

    const update = await runCli({
      args: [
        "--output",
        "json",
        "tx",
        "update",
        "--id",
        created.id,
        "--price",
        "120",
      ],
      cwd: cliPackageDir,
      env,
    });
    expect(update.exitCode).toBe(0);
    expectJsonSuccess(update.stdout, "tx.update");

    const remove = await runCli({
      args: ["--output", "json", "tx", "delete", "--id", created.id, "--yes"],
      cwd: cliPackageDir,
      env,
    });
    expect(remove.exitCode).toBe(0);
    expectJsonSuccess(remove.stdout, "tx.delete");

    const logout = await runCli({
      args: ["--output", "json", "auth", "logout"],
      cwd: cliPackageDir,
      env,
    });
    expect(logout.exitCode).toBe(0);
    expectJsonSuccess(logout.stdout, "auth.logout");

    const listAfterLogout = await runCli({
      args: ["--output", "json", "tx", "list"],
      cwd: cliPackageDir,
      env,
    });
    expect(listAfterLogout.exitCode).toBe(3);
    const unauthorized = expectJsonError(listAfterLogout.stderr);
    expect(unauthorized.error.code).toBe("CLI_API_UNAUTHORIZED");
  });

  it("requires --yes for tx delete in non-interactive json mode", async () => {
    const env = await createCliEnv(oidc.issuer, api.baseUrl, tempHomes);

    const result = await runCli({
      args: ["--output", "json", "tx", "delete", "--id", "tx-1"],
      cwd: cliPackageDir,
      env,
    });

    expect(result.exitCode).toBe(2);
    const payload = expectJsonError(result.stderr);
    expect(payload.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
  });

  it("fails unknown command with stable json contract", async () => {
    const env = await createCliEnv(oidc.issuer, api.baseUrl, tempHomes);

    const result = await runCli({
      args: ["--output", "json", "unknown"],
      cwd: cliPackageDir,
      env,
    });

    expect(result.exitCode).toBe(2);
    const payload = expectJsonError(result.stderr);
    expect(payload.error.code).toBe("CLI_COMMAND_INVALID_ARGUMENT");
  });

  it("refreshes expired tokens before calling API", async () => {
    oidc.reset({ accessTokenExpiresInSeconds: 1 });
    const env = await createCliEnv(oidc.issuer, api.baseUrl, tempHomes);

    const login = await runCli({
      args: ["--output", "json", "auth", "login", "--device"],
      cwd: cliPackageDir,
      env,
    });
    expect(login.exitCode).toBe(0);
    expectJsonSuccess(login.stdout, "auth.login");
    expect(oidc.refreshGrantCount).toBe(0);

    const whoami = await runCli({
      args: ["--output", "json", "auth", "whoami"],
      cwd: cliPackageDir,
      env,
    });
    expect(whoami.exitCode).toBe(0);
    expectJsonSuccess(whoami.stdout, "auth.whoami");
    expect(oidc.refreshGrantCount).toBe(1);
  });

  it("keeps stdout machine-readable json in --output json mode", async () => {
    const env = await createCliEnv(oidc.issuer, api.baseUrl, tempHomes);

    const login = await runCli({
      args: ["--output", "json", "auth", "login", "--device"],
      cwd: cliPackageDir,
      env,
    });

    expect(login.exitCode).toBe(0);
    expect(() => parseJsonFromStdout(login.stdout)).not.toThrow();
    expect(login.stdout).not.toContain("Open this URL to continue login:");
    expect(login.stderr).toContain("Open this URL to continue login:");
  });
});

async function createCliEnv(
  issuer: string,
  apiBaseUrl: string,
  tempHomes: string[],
): Promise<NodeJS.ProcessEnv> {
  const homeDir = await mkdtemp(join(tmpdir(), "o3o-cli-e2e-home-"));
  tempHomes.push(homeDir);

  return {
    HOME: homeDir,
    NO_COLOR: "1",
    O3O_ALLOW_FILE_TOKEN_STORE: "0",
    O3O_API_BASE_URL: apiBaseUrl,
    O3O_OIDC_AUDIENCE: "https://api.o3o.app",
    O3O_OIDC_CLIENT_ID: "test-cli-client",
    O3O_OIDC_ISSUER: issuer,
    O3O_TOKEN_STORE_BACKEND: "file",
    TZ: "UTC",
    XDG_CONFIG_HOME: join(homeDir, "xdg"),
  };
}

function expectJsonError(stdout: string): JsonErrorEnvelope {
  const parsed = parseJsonFromStdout(stdout) as JsonErrorEnvelope;
  expect(parsed.ok).toBe(false);
  expect(parsed.meta.schemaVersion).toBe("v1");
  expect(typeof parsed.error.message).toBe("string");
  return parsed;
}

function expectJsonSuccess(
  stdout: string,
  command: string,
): JsonSuccessEnvelope {
  const parsed = parseJsonFromStdout(stdout) as JsonSuccessEnvelope;
  expect(parsed.ok).toBe(true);
  expect(parsed.command).toBe(command);
  expect(parsed.meta.schemaVersion).toBe("v1");
  return parsed;
}
