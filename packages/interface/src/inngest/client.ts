import { Inngest } from "inngest";

/**
 * Required configuration for constructing an Inngest client.
 *
 * `eventKey` is required by Inngest runtime and is validated at creation time.
 *
 * @public
 */
export type InngestClientConfig = {
  eventKey: string;
  id: string;
};

/**
 * Create a typed Inngest client.
 *
 * Runtime precondition:
 * - `eventKey` must be a non-empty string; an empty value throws.
 * @param config Client id/event key pair.
 * @returns Inngest instance.
 * @public
 */
export function createInngestClient(config: InngestClientConfig): Inngest {
  if (!config.eventKey) {
    throw new Error("Inngest event key is required");
  }
  return new Inngest({
    id: config.id,
    eventKey: config.eventKey,
  });
}
