import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from "node:http";

import type { MockOidcPrincipal } from "./mock-oidc-server";

type MockApiServerOptions = {
  resolveAccessToken(token: string): MockOidcPrincipal | null;
};

type StoredTransaction = {
  amount: string;
  createdAt: string;
  currency: string;
  datetime: string;
  id: string;
  price: string;
  type: "BUY" | "SELL";
  updatedAt: string;
  userId: string;
};

export class MockApiServer {
  public get baseUrl(): string {
    if (this.port === null) {
      throw new Error("Mock API server is not started.");
    }
    return `http://127.0.0.1:${this.port}`;
  }
  private nextTransactionId = 1;
  private port: null | number = null;
  private readonly resolveAccessToken: MockApiServerOptions["resolveAccessToken"];
  private readonly server: Server;

  private readonly transactions = new Map<string, StoredTransaction>();

  public constructor(options: MockApiServerOptions) {
    this.resolveAccessToken = options.resolveAccessToken;
    this.server = createServer((req, res) => {
      void this.handleRequest(req, res);
    });
  }

  public reset(): void {
    this.transactions.clear();
    this.nextTransactionId = 1;
  }

  public async start(): Promise<void> {
    if (this.port !== null) return;
    await new Promise<void>((resolve, reject) => {
      this.server.once("error", reject);
      this.server.listen(0, "127.0.0.1", () => {
        this.server.off("error", reject);
        const address = this.server.address();
        if (!address || typeof address === "string") {
          reject(new Error("Failed to resolve mock API server address."));
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

  private authorize(
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
    requiredScopes: string[],
  ): MockOidcPrincipal | null {
    const header = req.headers["authorization"];
    const token = this.parseBearerToken(header);
    if (!token) {
      this.sendError(
        res,
        401,
        "CLI_API_UNAUTHORIZED",
        "Unauthorized. Please run `o3o auth login`.",
      );
      return null;
    }

    const principal = this.resolveAccessToken(token);
    if (!principal) {
      this.sendError(
        res,
        401,
        "CLI_API_UNAUTHORIZED",
        "Unauthorized. Please run `o3o auth login`.",
      );
      return null;
    }

    for (const scope of requiredScopes) {
      if (!principal.scopes.includes(scope)) {
        this.sendError(
          res,
          403,
          "CLI_SCOPE_FORBIDDEN",
          `Required scope is missing: ${scope}`,
        );
        return null;
      }
    }

    return principal;
  }

  private async handleRequest(
    req: IncomingMessage,
    res: ServerResponse<IncomingMessage>,
  ): Promise<void> {
    const url = new URL(req.url ?? "/", this.baseUrl);
    const method = req.method ?? "GET";

    if (url.pathname === "/api/cli/v1/me" && method === "GET") {
      const auth = this.authorize(req, res, ["transactions:read"]);
      if (!auth) return;
      this.sendJson(res, 200, {
        issuer: auth.issuer,
        scopes: auth.scopes,
        subject: auth.subject,
        userId: auth.userId,
      });
      return;
    }

    if (url.pathname === "/api/cli/v1/transactions" && method === "GET") {
      const auth = this.authorize(req, res, ["transactions:read"]);
      if (!auth) return;
      const rows = [...this.transactions.values()].filter(
        (tx) => tx.userId === auth.userId,
      );
      this.sendJson(res, 200, rows);
      return;
    }

    if (url.pathname === "/api/cli/v1/transactions" && method === "POST") {
      const auth = this.authorize(req, res, ["transactions:write"]);
      if (!auth) return;
      const payload = await this.readJsonBody(req);
      if (!payload || !isCreatePayload(payload)) {
        this.sendError(
          res,
          422,
          "CLI_API_REQUEST_FAILED",
          "Invalid transaction payload.",
        );
        return;
      }
      const now = new Date().toISOString();
      const tx: StoredTransaction = {
        id: `tx-${this.nextTransactionId++}`,
        amount: String(payload.amount),
        createdAt: now,
        currency: String(payload.currency),
        datetime: String(payload.datetime),
        price: String(payload.price),
        type: payload.type,
        updatedAt: now,
        userId: auth.userId,
      };
      this.transactions.set(tx.id, tx);
      this.sendJson(res, 200, tx);
      return;
    }

    const transactionMatch = url.pathname.match(
      /^\/api\/cli\/v1\/transactions\/([^/]+)$/,
    );
    if (transactionMatch && method === "PATCH") {
      const auth = this.authorize(req, res, ["transactions:write"]);
      if (!auth) return;
      const id = decodeURIComponent(transactionMatch[1] ?? "");
      const current = this.transactions.get(id);
      if (!current || current.userId !== auth.userId) {
        this.sendError(res, 404, "CLI_API_REQUEST_FAILED", "Not Found");
        return;
      }

      const payload = await this.readJsonBody(req);
      if (!payload || typeof payload !== "object") {
        this.sendError(
          res,
          422,
          "CLI_API_REQUEST_FAILED",
          "Invalid transaction payload.",
        );
        return;
      }

      const next: StoredTransaction = {
        ...current,
        ...(typeof payload["amount"] === "string"
          ? { amount: payload["amount"] }
          : {}),
        ...(typeof payload["currency"] === "string"
          ? { currency: payload["currency"] }
          : {}),
        ...(typeof payload["datetime"] === "string"
          ? { datetime: payload["datetime"] }
          : {}),
        ...(typeof payload["price"] === "string"
          ? { price: payload["price"] }
          : {}),
        ...(payload["type"] === "BUY" || payload["type"] === "SELL"
          ? { type: payload["type"] }
          : {}),
        updatedAt: new Date().toISOString(),
      };

      this.transactions.set(next.id, next);
      this.sendJson(res, 200, next);
      return;
    }

    if (transactionMatch && method === "DELETE") {
      const auth = this.authorize(req, res, ["transactions:write"]);
      if (!auth) return;
      const id = decodeURIComponent(transactionMatch[1] ?? "");
      const current = this.transactions.get(id);
      if (!current || current.userId !== auth.userId) {
        this.sendError(res, 404, "CLI_API_REQUEST_FAILED", "Not Found");
        return;
      }

      this.transactions.delete(id);
      res.statusCode = 204;
      res.end();
      return;
    }

    this.sendError(res, 404, "CLI_API_REQUEST_FAILED", "Not Found");
  }

  private parseBearerToken(
    header: string | string[] | undefined,
  ): null | string {
    if (typeof header !== "string") return null;
    if (!header.startsWith("Bearer ")) return null;
    const token = header.slice("Bearer ".length).trim();
    return token || null;
  }

  private async readBody(req: IncomingMessage): Promise<string> {
    let data = "";
    for await (const chunk of req) {
      data += typeof chunk === "string" ? chunk : chunk.toString("utf8");
    }
    return data;
  }

  private async readJsonBody(
    req: IncomingMessage,
  ): Promise<null | Record<string, unknown>> {
    try {
      const text = await this.readBody(req);
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object") {
        return null;
      }
      return parsed as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private sendError(
    res: ServerResponse<IncomingMessage>,
    status: number,
    code: string,
    reason: string,
  ): void {
    this.sendJson(res, status, {
      code,
      details: {
        reason,
      },
      message: reason,
    });
  }

  private sendJson(
    res: ServerResponse<IncomingMessage>,
    status: number,
    payload: unknown,
  ): void {
    res.statusCode = status;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify(payload));
  }
}

function isCreatePayload(input: Record<string, unknown>): input is {
  amount: string;
  currency: string;
  datetime: string;
  price: string;
  type: "BUY" | "SELL";
} {
  return (
    typeof input["amount"] === "string" &&
    typeof input["currency"] === "string" &&
    typeof input["datetime"] === "string" &&
    typeof input["price"] === "string" &&
    (input["type"] === "BUY" || input["type"] === "SELL")
  );
}
