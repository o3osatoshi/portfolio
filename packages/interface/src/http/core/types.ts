import type { AuthUser } from "@repo/auth";

import type { Logger, RequestLogger } from "@o3osatoshi/logging";

export type ContextEnv = {
  Variables: {
    authUser?: AuthUser;
    error?: Error;
    logger?: Logger;
    requestId?: string;
    requestLogger?: RequestLogger;
  };
};
