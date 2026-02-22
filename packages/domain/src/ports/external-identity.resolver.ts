import type { ResultAsync } from "neverthrow";

import type { RichError } from "@o3osatoshi/toolkit";

import type { UserId } from "../value-objects";

export type ExternalIdentityClaimSet = {
  email?: string | undefined;
  emailVerified: boolean;
  image?: string | undefined;
  name?: string | undefined;
} & ExternalIdentityKey;

export type ExternalIdentityKey = {
  issuer: string;
  subject: string;
};

/**
 * Port for resolving internal user ids from external identity claims.
 */
export interface ExternalIdentityResolver {
  /**
   * Look up a linked user id by issuer/subject pair.
   */
  findUserIdByKey(
    key: ExternalIdentityKey,
  ): ResultAsync<null | UserId, RichError>;

  /**
   * Link or create an internal user id from the provided external identity.
   */
  linkByVerifiedEmail(
    claimSet: ExternalIdentityClaimSet,
  ): ResultAsync<UserId, RichError>;
}
