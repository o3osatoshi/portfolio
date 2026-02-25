/**
 * @packageDocumentation
 * Node HTTP adapter surface (`buildApp`, `buildHandler`, express adapter).
 */
export { createExpressRequestHandler } from "./adapter-express";
export { buildApp, buildHandler } from "./app";
export type { AppType, Deps } from "./app";
