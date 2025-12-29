import type { AuthUser } from "@repo/auth";

import type { Logger, RequestLogger } from "@o3osatoshi/logging";

export type ContextEnv = {
  Variables: {
    authUser?: AuthUser;
    logger?: Logger;
    requestId?: string;
    requestLogger?: RequestLogger;
  };
};
