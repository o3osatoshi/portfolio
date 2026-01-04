import { Inngest } from "inngest";

export type InngestClientConfig = {
  eventKey: string;
  id: string;
};

export function createInngestClient(config: InngestClientConfig): Inngest {
  if (!config.eventKey) {
    throw new Error("Inngest event key is required");
  }
  return new Inngest({
    id: config.id,
    eventKey: config.eventKey,
  });
}
