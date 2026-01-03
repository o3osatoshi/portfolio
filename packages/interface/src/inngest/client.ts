import { Inngest } from "inngest";

export type InngestClientConfig = {
  eventKey: string;
  id: string;
};

export function createInngestClient(config: InngestClientConfig): Inngest {
  return new Inngest({
    id: config.id,
    eventKey: config.eventKey,
  });
}
