import { serve } from "@hono/node-server";

import { buildApp } from "../core/app";
import { makeNodeDeps } from "./deps";

/**
 * Lightweight local development server for the Hono app.
 *
 * Starts an HTTP server on port 8787 and logs the local URL.
 * This file is used by the package `dev` script.
 */
const app = buildApp(makeNodeDeps());
serve({ fetch: app.fetch, port: 8787 });
console.log("http://localhost:8787");
