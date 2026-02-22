import {
  type ExternalIdentityClaimSet,
  type ExternalIdentityKey,
  type ExternalIdentityResolver,
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
  findUserIdByKey(
    key: ExternalIdentityKey,
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
   * Link or create an internal user id using a verified external identity.
   */
  linkExternalIdentityToUserByEmail(
    claim: ExternalIdentityClaimSet,
  ): ResultAsync<UserId, RichError> {
    if (!claim.email || !claim.emailVerified) {
      return errAsync(
        newRichError({
          code: "PRISMA_EXTERNAL_IDENTITY_EMAIL_UNVERIFIED",
          details: {
            action: "LinkExternalIdentityToUserByEmail",
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
            action: "LinkExternalIdentityToUserByEmail",
          },
        }),
    )
      .andThen((row) => parseUserId(row.userId, "LinkExternalIdentityToUserByEmail"))
      .orElse((error) => {
        if (error.code !== "PRISMA_P2002_UNIQUE_CONSTRAINT") {
          return errAsync(error);
        }

        // A concurrent request may have linked the same issuer/subject first.
        // Retry by reading the canonical mapping and return it when available.
        return this.findUserIdByKey(claim).andThen((userId) =>
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
