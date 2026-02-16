import type { AuthUser } from "@repo/auth";

import type { Logger, RequestLogger } from "@o3osatoshi/logging";
import type { RichError } from "@o3osatoshi/toolkit";

export type ContextEnv = {
  Variables: {
    authUser?: AuthUser;
    cliPrincipal?: {
      issuer: string;
      scopes: string[];
      subject: string;
      userId: string;
    };
    error?: RichError;
    logger?: Logger;
    requestId?: string;
    requestLogger?: RequestLogger;
  };
};
