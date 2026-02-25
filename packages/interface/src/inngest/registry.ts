import type { Inngest } from "inngest";

import {
  createStorePingFunction,
  type StorePingFunctionDeps,
} from "./functions/store-ping";

/**
 * Dependency map passed to registered Inngest functions.
 *
 * Extend this interface as new functions are added.
 *
 * @public
 */
export type InngestFunctionsDeps = {
  storePing: StorePingFunctionDeps;
};

/**
 * Register all Inngest functions for the current service.
 *
 * Returns an array of function handlers suitable for `inngest.createFunction`.
 *
 * @param inngest Inngest app instance.
 * @param deps Deps required by all registered functions.
 * @returns Registered functions array.
 * @public
 */
export function createInngestFunctions(
  inngest: Inngest,
  deps: InngestFunctionsDeps,
) {
  return [createStorePingFunction(inngest, deps.storePing)];
}
