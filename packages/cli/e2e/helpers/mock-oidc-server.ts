import { createServer, type IncomingMessage, type Server } from "node:http";

export type MockOidcPrincipal = {
  issuer: string;
  scopes: string[];
  subject: string;
  userId: string;
};

type MockOidcServerOptions = {
  accessTokenExpiresInSeconds?: number | undefined;
};

export class MockOidcServer {
  public get issuer(): string {
    if (this.port === null) {
      throw new Error("Mock OIDC server is not started.");
    }
    return `http://127.0.0.1:${this.port}`;
  }
  public get refreshGrantCount(): number {
    return this.refreshGrantCountValue;
  }
  private accessTokenExpiresInSeconds: number;
  private readonly accessTokens = new Map<string, MockOidcPrincipal>();
  private readonly defaultScopes = [
    "openid",
    "profile",
    "email",
    "transactions:read",
    "transactions:write",
    "offline_access",
  ] as const;
  private nextTokenId = 1;
  private port: null | number = null;
  private refreshGrantCountValue = 0;
  private readonly refreshTokens = new Map<string, MockOidcPrincipal>();
  private readonly server: Server;

  private readonly subject = "google-oauth2|e2e-user";

  private readonly userId = "user-e2e-1";

  public constructor(options: MockOidcServerOptions = {}) {
    this.accessTokenExpiresInSeconds =
      options.accessTokenExpiresInSeconds ?? 3600;
    this.server = createServer((req, res) => {
      void this.handleRequest(req, res);
    });
  }

  public reset(options: MockOidcServerOptions = {}): void {
    this.accessTokens.clear();
    this.refreshTokens.clear();
    this.nextTokenId = 1;
    this.refreshGrantCountValue = 0;
    this.accessTokenExpiresInSeconds =
      options.accessTokenExpiresInSeconds ?? 3600;
  }

  public resolveAccessToken(token: string): MockOidcPrincipal | null {
    return this.accessTokens.get(token) ?? null;
  }

  public async start(): Promise<void> {
    if (this.port !== null) return;
    await new Promise<void>((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(0, "127.0.0.1", () => {
        this.server.off("error", reject);
        const address = this.server.address();
        if (!address || typeof address === "string") {
          reject(new Error("Failed to resolve mock OIDC server address."));
          return;
        }
        this.port = address.port;
        resolve();
      });
    });
  }

  public async stop(): Promise<void> {
    if (this.port === null) return;
    await new Promise<void>((resolve, reject) => {
      this.server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
    this.port = null;
  }

  private async handleRequest(
    req: IncomingMessage,
    res: import("node:http").ServerResponse<IncomingMessage>,
  ): Promise<void> {
    const url = new URL(req.url ?? "/", this.issuer);
    const method = req.method ?? "GET";

    if (
      method === "GET" &&
      url.pathname === "/.well-known/openid-configuration"
    ) {
      this.sendJson(res, 200, {
        authorization_endpoint: `${this.issuer}/authorize`,
        device_authorization_endpoint: `${this.issuer}/oauth/device/code`,
        revocation_endpoint: `${this.issuer}/oauth/revoke`,
        token_endpoint: `${this.issuer}/oauth/token`,
      });
      return;
    }

    if (method === "POST" && url.pathname === "/oauth/device/code") {
      this.sendJson(res, 200, {
        device_code: "mock-device-code",
        expires_in: 600,
        interval: 1,
        user_code: "ABCD-EFGH",
        verification_uri: `${this.issuer}/activate`,
        verification_uri_complete: `${this.issuer}/activate?user_code=ABCD-EFGH`,
      });
      return;
    }

    if (method === "POST" && url.pathname === "/oauth/token") {
      const body = await this.readBody(req);
      const form = new URLSearchParams(body);
      const grantType = form.get("grant_type");

      if (grantType === "urn:ietf:params:oauth:grant-type:device_code") {
        const issued = this.issueTokens(this.accessTokenExpiresInSeconds);
        this.sendJson(res, 200, issued);
        return;
      }

      if (grantType === "refresh_token") {
        const refreshToken = form.get("refresh_token");
        if (!refreshToken || !this.refreshTokens.has(refreshToken)) {
          this.sendJson(res, 403, { error: "invalid_grant" });
          return;
        }

        this.refreshGrantCountValue += 1;
        const principal = this.refreshTokens.get(refreshToken);
        if (!principal) {
          this.sendJson(res, 403, { error: "invalid_grant" });
          return;
        }

        const issued = this.issueTokens(3600, principal);
        this.sendJson(res, 200, issued);
        return;
      }

      this.sendJson(res, 400, { error: "unsupported_grant_type" });
      return;
    }

    if (method === "POST" && url.pathname === "/oauth/revoke") {
      const body = await this.readBody(req);
      const form = new URLSearchParams(body);
      const refreshToken = form.get("token");
      if (refreshToken) {
        this.refreshTokens.delete(refreshToken);
      }
      this.sendJson(res, 200, {});
      return;
    }

    this.sendJson(res, 404, { error: "not_found" });
  }

  private issueTokens(
    expiresInSeconds: number,
    principalOverride?: MockOidcPrincipal,
  ): {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    token_type: string;
  } {
    const id = this.nextTokenId++;
    const accessToken = `access-token-${id}`;
    const refreshToken = `refresh-token-${id}`;

    const principal: MockOidcPrincipal = principalOverride ?? {
      issuer: this.issuer,
      scopes: [...this.defaultScopes],
      subject: this.subject,
      userId: this.userId,
    };

    this.accessTokens.set(accessToken, principal);
    this.refreshTokens.set(refreshToken, principal);

    return {
      access_token: accessToken,
      expires_in: expiresInSeconds,
      refresh_token: refreshToken,
      scope: principal.scopes.join(" "),
      token_type: "Bearer",
    };
  }

  private async readBody(req: IncomingMessage): Promise<string> {
    let data = "";
    for await (const chunk of req) {
      data += typeof chunk === "string" ? chunk : chunk.toString("utf8");
    }
    return data;
  }

  private sendJson(
    res: import("node:http").ServerResponse<IncomingMessage>,
    status: number,
    payload: unknown,
  ): void {
    res.statusCode = status;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(payload));
  }
}
