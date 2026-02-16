import { z } from "zod";

import { getRuntimeConfig } from "./config";
import { refreshToken } from "./oidc";
import { clearTokenSet, readTokenSet, writeTokenSet } from "./token-store";
import type { TokenSet } from "./types";

const meSchema = z.object({
  issuer: z.string(),
  scopes: z.array(z.string()),
  subject: z.string(),
  userId: z.string(),
});

const transactionSchema = z.object({
  id: z.string(),
  amount: z.string(),
  createdAt: z.string().or(z.date()),
  currency: z.string(),
  datetime: z.string().or(z.date()),
  price: z.string(),
  type: z.enum(["BUY", "SELL"]),
  updatedAt: z.string().or(z.date()),
  userId: z.string(),
});

export type MeResponse = z.infer<typeof meSchema>;
export type TransactionResponse = z.infer<typeof transactionSchema>;

export async function createTransaction(
  payload: Record<string, unknown>,
): Promise<TransactionResponse> {
  const json = await request("/api/cli/v1/transactions", {
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  });
  return transactionSchema.parse(json);
}

export async function deleteTransaction(id: string): Promise<void> {
  await request(`/api/cli/v1/transactions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export async function fetchMe(): Promise<MeResponse> {
  const json = await request("/api/cli/v1/me", {
    method: "GET",
  });
  return meSchema.parse(json);
}

export async function listTransactions(): Promise<TransactionResponse[]> {
  const json = await request("/api/cli/v1/transactions", {
    method: "GET",
  });
  return z.array(transactionSchema).parse(json);
}

export async function updateTransaction(
  id: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await request(`/api/cli/v1/transactions/${encodeURIComponent(id)}`, {
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json",
    },
    method: "PATCH",
  });
}

async function ensureAccessToken(): Promise<TokenSet> {
  const config = getRuntimeConfig();
  const token = await readTokenSet();
  if (!token) throw new Error("Not logged in. Run `o3o auth login`.");

  if (!token.expires_at || token.expires_at > nowSeconds() + 60) {
    return token;
  }

  if (!token.refresh_token) {
    throw new Error("Session expired. Run `o3o auth login` again.");
  }

  const refreshed = await refreshToken(config.oidc, token.refresh_token);
  await writeTokenSet({
    ...token,
    ...refreshed,
    refresh_token: refreshed.refresh_token ?? token.refresh_token,
  });

  return {
    ...token,
    ...refreshed,
    refresh_token: refreshed.refresh_token ?? token.refresh_token,
  };
}

function nowSeconds() {
  return Math.floor(Date.now() / 1000);
}

async function request(path: string, init: RequestInit): Promise<unknown> {
  const config = getRuntimeConfig();
  const token = await ensureAccessToken();

  const url = new URL(path, config.apiBaseUrl).toString();
  const headers = new Headers(init.headers);
  headers.set("authorization", `Bearer ${token.access_token}`);

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (response.status === 401) {
    await clearTokenSet();
    throw new Error("Unauthorized. Please run `o3o auth login`.");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API request failed (${response.status}): ${text}`);
  }

  const method = (init.method ?? "GET").toUpperCase();
  if (method === "DELETE" || response.status === 204) return undefined;
  return response.json();
}
