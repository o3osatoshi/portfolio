import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import type { UserId } from "../value-objects";

export type ExternalKey = {
  issuer: string;
  subject: string;
};

export type IdentityClaims = {
  email?: string | undefined;
  emailVerified: boolean;
  image?: string | undefined;
  name?: string | undefined;
} & ExternalKey;

/**
 * Port for resolving internal user ids from external identity claims.
 */
export interface UserIdentityResolver {
  /**
   * Look up a linked user id by issuer/subject pair.
   */
  findUserIdByExternalKey(
    externalKey: ExternalKey,
  ): ResultAsync<null | UserId, RichError>;

  /**
   * Resolve or link an internal user id for the provided identity context.
   */
  resolveUserId(claims: IdentityClaims): ResultAsync<UserId, RichError>;
}
