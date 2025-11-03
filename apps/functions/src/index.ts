import { app } from "@repo/interface/http/node";
import { createFirebaseHandler } from "@repo/interface/http/node/adapter-firebase";

// Expose the interface-driven API on Firebase Functions.
// Base path is `/api` as defined by the interface's Node app.
export const api = createFirebaseHandler(app);
