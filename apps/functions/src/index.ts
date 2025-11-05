import { app, createExpressRequestHandler } from "@repo/interface/http/node";
import { onRequest } from "firebase-functions/v2/https";

// Expose the interface-driven API on Firebase Functions.
// Base path is `/api` as defined by the interface's Node app.
export const api = onRequest(createExpressRequestHandler(app));
