import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import type { UserId } from "../value-objects";

export type IdentityKey = {
  issuer: string;
  subject: string;
};

export type ResolveUserByIdentityInput = {
  email?: string | undefined;
  emailVerified: boolean;
  image?: string | undefined;
  name?: string | undefined;
} & IdentityKey;

/**
 * Port for resolving internal user ids from external identity claims.
 */
export interface UserIdentityResolver {
  /**
   * Look up a linked user id by issuer/subject pair.
   */
  findUserIdByIssuerSubject(
    input: IdentityKey,
  ): ResultAsync<null | UserId, RichError>;

  /**
   * Resolve or link an internal user id for the provided identity context.
   */
  resolveUserId(
    input: ResolveUserByIdentityInput,
  ): ResultAsync<UserId, RichError>;
}
