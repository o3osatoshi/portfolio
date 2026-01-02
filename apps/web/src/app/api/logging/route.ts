import { initWebNodeLogger } from "@/lib/logger/node";
import { createNodeProxyHandler } from "@o3osatoshi/logging/node";

export const runtime = "nodejs";

initWebNodeLogger();

export const POST = createNodeProxyHandler();
