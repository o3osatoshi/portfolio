import { initWebNodeLogger } from "@/lib/logger/node";
import { createNodeProxyHandler } from "@o3osatoshi/logging/node";

initWebNodeLogger();

export const POST = createNodeProxyHandler();
