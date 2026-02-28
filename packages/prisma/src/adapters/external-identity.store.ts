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
import { externalIdentityErrorCodes } from "./external-identity-error-catalog";

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
    claimSet: ExternalIdentityClaimSet,
  ): ResultAsync<UserId, RichError> {
    if (!claimSet.email || !claimSet.emailVerified) {
      return errAsync(
        newRichError({
          code: externalIdentityErrorCodes.EMAIL_UNVERIFIED,
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
          issuer: claimSet.issuer,
          subject: claimSet.subject,
          user: {
            connectOrCreate: {
              create: {
                email: claimSet.email,
                ...(claimSet.name ? { name: claimSet.name } : {}),
                ...(claimSet.image ? { image: claimSet.image } : {}),
              },
              where: {
                email: claimSet.email,
              },
            },
          },
        },
        select: { userId: true },
        update: {},
        where: {
          issuer_subject: {
            issuer: claimSet.issuer,
            subject: claimSet.subject,
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
      .andThen((row) =>
        parseUserId(row.userId, "LinkExternalIdentityToUserByEmail"),
      )
      .orElse((error) => {
        if (error.code !== "PRISMA_P2002_UNIQUE_CONSTRAINT") {
          return errAsync(error);
        }

        // A concurrent request may have linked the same issuer/subject first.
        // Retry by reading the canonical mapping and return it when available.
        return this.findUserIdByKey(claimSet).andThen((userId) =>
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
      code: externalIdentityErrorCodes.USER_ID_INVALID,
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
