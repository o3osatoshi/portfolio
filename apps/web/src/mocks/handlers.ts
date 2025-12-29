import { delay, http, HttpResponse, type HttpRequest } from "msw";

import { getPath } from "@/utils/nav-handler";

const me = {
  id: "u-msw",
  name: "MSW User",
};

const transactions = [
  {
    id: "t-msw-1",
    amount: "1.0",
    createdAt: new Date(0).toISOString(),
    currency: "USD",
    datetime: new Date(0).toISOString(),
    price: "100.0",
    type: "BUY",
    updatedAt: new Date(0).toISOString(),
    userId: me.id,
  },
];

const heavyProcessCached = {
  cached: true,
  timestamp: new Date(0).toISOString(),
};

type Scenario = "success" | "empty" | "unauthorized" | "error" | "delay";

function resolveScenario(request: HttpRequest): Scenario {
  const url = new URL(request.url);
  const raw =
    request.headers.get("x-msw-scenario") ??
    url.searchParams.get("msw") ??
    process.env["NEXT_PUBLIC_MSW_SCENARIO"] ??
    "success";
  const normalized = raw.trim().toLowerCase();
  if (
    normalized === "empty" ||
    normalized === "unauthorized" ||
    normalized === "error" ||
    normalized === "delay"
  ) {
    return normalized;
  }
  return "success";
}

function resolveDelayMs(request: HttpRequest): null | number {
  const url = new URL(request.url);
  const raw =
    request.headers.get("x-msw-delay") ??
    url.searchParams.get("mswDelay") ??
    process.env["NEXT_PUBLIC_MSW_DELAY"];
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

async function applyDelay(
  request: HttpRequest,
  scenario: Scenario,
  defaultDelayMs: number,
) {
  const delayMs = resolveDelayMs(request);
  if (scenario !== "delay" && delayMs === null) return;
  await delay(delayMs ?? defaultDelayMs);
}

function errorPayload(name: string, message: string) {
  return { name, message };
}

export const handlers = [
  http.get(getPath("me"), async ({ request }) => {
    const scenario = resolveScenario(request);
    await applyDelay(request, scenario, 400);

    if (scenario === "unauthorized") {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (scenario === "error") {
      return HttpResponse.json(
        errorPayload("ApplicationUnknownError", "MSW forced error"),
        { status: 500 },
      );
    }

    return HttpResponse.json(me);
  }),
  http.get(getPath("labs-transactions"), async ({ request }) => {
    const scenario = resolveScenario(request);
    await applyDelay(request, scenario, 600);

    if (scenario === "unauthorized") {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (scenario === "error") {
      return HttpResponse.json(
        errorPayload("ApplicationUnknownError", "MSW forced error"),
        { status: 500 },
      );
    }

    if (scenario === "empty") {
      return HttpResponse.json([]);
    }

    return HttpResponse.json(transactions);
  }),
  http.get(getPath("heavy-process-cached"), async ({ request }) => {
    const scenario = resolveScenario(request);
    await applyDelay(request, scenario, 1200);

    if (scenario === "unauthorized") {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (scenario === "error") {
      return HttpResponse.json(
        errorPayload("ApplicationUnknownError", "MSW forced error"),
        { status: 500 },
      );
    }

    return HttpResponse.json(heavyProcessCached);
  }),
];
