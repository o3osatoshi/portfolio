import { serve } from "inngest/express";

/**
 * Request options for `inngest/express` `serve`.
 *
 * @public
 */
export type InngestExpressHandlerConfig = Parameters<typeof serve>[0];

/**
 * Create an Express-compatible Inngest handler.
 *
 * @param config Inngest express adapter config.
 * @returns Handler returned by `serve(config)`.
 * @public
 */
export function createInngestExpressHandler(
  config: InngestExpressHandlerConfig,
) {
  return serve(config);
}
