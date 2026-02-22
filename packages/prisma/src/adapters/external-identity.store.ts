import {
  type ExternalIdentityResolver,
  type ExternalKey,
  type IdentityClaim,
  newUserId,
  type UserId,
} from "@repo/domain";
import { errAsync, okAsync, ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import type { PrismaClient } from "../prisma-client";
import { newPrismaError } from "../prisma-error";

/**
 * Identity-backed user resolution for CLI access tokens.
 *
 * The store keeps `issuer + subject` as the primary lookup key and only falls
 * back to verified email when first linking a user.
 */
export class PrismaExternalIdentityStore implements ExternalIdentityResolver {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Look up an existing user id by OIDC issuer/subject pair.
   */
  findUserIdByExternalKey(
    key: ExternalKey,
  ): ResultAsync<null | UserId, RichError> {
    return ResultAsync.fromPromise(
      this.db.externalIdentity.findUnique({
        select: { userId: true },
        where: {
          issuer_subject: {
            issuer: key.issuer,
            subject: key.subject,
          },
        },
      }),
      (cause) =>
        newPrismaError({
          cause,
          details: {
            action: "FindExternalIdentityByIssuerSubject",
          },
        }),
    ).andThen((row) =>
      row
        ? parseUserId(row.userId, "FindExternalIdentityByIssuerSubject")
        : okAsync(null),
    );
  }

  /**
   * Resolve an internal user id for the given identity.
   *
   * - Existing identity -> returns mapped user id.
   * - New identity -> links/creates user by verified email.
   */
  resolveUserId(claim: IdentityClaim): ResultAsync<UserId, RichError> {
    return this.findUserIdByExternalKey(claim).andThen((userId) => {
      if (userId) return okAsync(userId);
      return this.linkByVerifiedEmail(claim);
    });
  }

  private linkByVerifiedEmail(
    claim: IdentityClaim,
  ): ResultAsync<UserId, RichError> {
    if (!claim.email || !claim.emailVerified) {
      return errAsync(
        newRichError({
          code: "PRISMA_EXTERNAL_IDENTITY_EMAIL_UNVERIFIED",
          details: {
            action: "LinkExternalIdentity",
            reason:
              "Verified email is required to auto-link or auto-create a user.",
          },
          i18n: { key: "errors.application.unauthorized" },
          isOperational: true,
          kind: "Unauthorized",
          layer: "Persistence",
        }),
      );
    }

    return ResultAsync.fromPromise(
      this.db.externalIdentity.upsert({
        create: {
          issuer: claim.issuer,
          subject: claim.subject,
          user: {
            connectOrCreate: {
              create: {
                email: claim.email,
                ...(claim.name ? { name: claim.name } : {}),
                ...(claim.image ? { image: claim.image } : {}),
              },
              where: {
                email: claim.email,
              },
            },
          },
        },
        select: { userId: true },
        update: {},
        where: {
          issuer_subject: {
            issuer: claim.issuer,
            subject: claim.subject,
          },
        },
      }),
      (cause) =>
        newPrismaError({
          cause,
          details: {
            action: "LinkExternalIdentity",
          },
        }),
    )
      .andThen((row) => parseUserId(row.userId, "LinkExternalIdentity"))
      .orElse((error) => {
        if (error.code !== "PRISMA_P2002_UNIQUE_CONSTRAINT") {
          return errAsync(error);
        }

        // A concurrent request may have linked the same issuer/subject first.
        // Retry by reading the canonical mapping and return it when available.
        return this.findUserIdByExternalKey(claim).andThen((userId) =>
          userId ? okAsync(userId) : errAsync(error),
        );
      });
  }
}

function parseUserId(
  userId: string,
  action: string,
): ResultAsync<UserId, RichError> {
  const result = newUserId(userId);
  if (result.isOk()) {
    return okAsync(result.value);
  }
  return errAsync(
    newRichError({
      cause: result.error,
      code: "PRISMA_EXTERNAL_IDENTITY_USER_ID_INVALID",
      details: {
        action,
        reason: "Persisted user id does not satisfy domain UserId constraints.",
      },
      isOperational: false,
      kind: "Internal",
      layer: "Persistence",
    }),
  );
}
