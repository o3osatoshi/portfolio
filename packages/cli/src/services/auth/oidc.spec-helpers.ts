import { createServer, get as httpGet } from "node:http";

import { expect } from "vitest";

import type { OidcConfig } from "../../common/types";

export const config: OidcConfig = {
  audience: "https://api.o3o.app",
  clientId: "cli-client-id",
  issuer: "https://example.auth0.com",
  redirectPort: 38080,
};

export function expectHeader(
  header: string | string[] | undefined,
  expected: string,
) {
  if (Array.isArray(header)) {
    expect(header.join(", ")).toBe(expected);
    return;
  }
  expect(header).toBe(expected);
}

export async function getAvailablePort(): Promise<number> {
  const server = createServer();
  return await new Promise<number>((resolve, reject) => {
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        reject(new Error("Failed to resolve dynamic port."));
        return;
      }
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(address.port);
      });
    });
  });
}

export function jsonErrorResponse(error: string): Response {
  return new Response(JSON.stringify({ error }), {
    headers: {
      "content-type": "application/json",
    },
    status: 400,
  });
}

export function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: {
      "content-type": "application/json",
    },
    status: 200,
  });
}

export async function requestLocal(url: string): Promise<{
  body: string;
  headers: import("node:http").IncomingHttpHeaders;
  status: number;
}> {
  return await new Promise((resolve, reject) => {
    const req = httpGet(url, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => {
        body += chunk;
      });
      res.on("end", () => {
        resolve({
          body,
          headers: res.headers,
          status: res.statusCode ?? 0,
        });
      });
    });
    req.on("error", reject);
  });
}

export async function waitForAuthorizationUrlFromCalls(
  execFileCalls: unknown[][],
): Promise<URL> {
  for (let i = 0; i < 100; i += 1) {
    if (execFileCalls.length > 0) {
      break;
    }
    await sleep(10);
  }

  if (execFileCalls.length === 0) {
    throw new Error("Browser launcher was not called.");
  }

  const call = execFileCalls[0];
  const args = Array.isArray(call?.[1]) ? call[1] : [];
  const authorizationUrl = args[0];
  if (typeof authorizationUrl !== "string") {
    throw new Error("Authorization URL was not passed to browser launcher.");
  }
  return new URL(authorizationUrl);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
