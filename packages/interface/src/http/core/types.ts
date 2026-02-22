import type { AccessTokenPrin, AuthUser } from "@repo/auth";

import type { Logger, RequestLogger } from "@o3osatoshi/logging";
import type { RichError } from "@o3osatoshi/toolkit";

export type ContextEnv = {
  Variables: {
    accessTokenPrin?: AccessTokenPrin;
    authUser?: AuthUser;
    error?: RichError;
    logger?: Logger;
    requestId?: string;
    requestLogger?: RequestLogger;
  };
};
