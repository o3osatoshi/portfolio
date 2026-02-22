import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import type { UserId } from "../value-objects";

/**
 * Port for resolving internal user ids from external identity claims.
 */
export interface ExternalIdentityResolver {
  /**
   * Look up a linked user id by issuer/subject pair.
   */
  findUserIdByKey(key: ExternalKey): ResultAsync<null | UserId, RichError>;

  /**
   * Resolve or link an internal user id for the provided identity context.
   */
  resolveUserId(claim: IdentityClaim): ResultAsync<UserId, RichError>;
}

export type ExternalKey = {
  issuer: string;
  subject: string;
};

export type IdentityClaim = {
  email?: string | undefined;
  emailVerified: boolean;
  image?: string | undefined;
  name?: string | undefined;
} & ExternalKey;
