import type { Inngest } from "inngest";

import {
  createStorePingFunction,
  type StorePingFunctionDeps,
} from "./functions/store-ping";

export type InngestFunctionsDeps = {
  storePing: StorePingFunctionDeps;
};

export function createInngestFunctions(
  inngest: Inngest,
  deps: InngestFunctionsDeps,
) {
  return [createStorePingFunction(inngest, deps.storePing)];
}
