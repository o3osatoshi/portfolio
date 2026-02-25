import { GetFxQuoteUseCase, parseGetFxQuoteRequest } from "@repo/application";
import type { GetFxQuoteResponse } from "@repo/application";
import { Hono } from "hono";

import { respondAsync } from "../../core";
import type { ContextEnv } from "../../core/types";
import type { Deps } from "../app";

export function buildPublicRoutes(deps: Deps) {
  return new Hono<ContextEnv>()
    .get("/healthz", (c) => c.json({ ok: true }))
    .get("/exchange-rate", (c) => {
      const query = c.req.query();
      const getFxQuote = new GetFxQuoteUseCase(deps.fxQuoteProvider);
      return respondAsync<GetFxQuoteResponse>(c)(
        parseGetFxQuoteRequest({
          base: query["base"],
          quote: query["quote"],
        }).asyncAndThen((res) => getFxQuote.execute(res)),
      );
    });
}
