import { serve } from "inngest/express";

export type InngestExpressHandlerConfig = Parameters<typeof serve>[0];

export function createInngestExpressHandler(
  config: InngestExpressHandlerConfig,
) {
  return serve(config);
}
