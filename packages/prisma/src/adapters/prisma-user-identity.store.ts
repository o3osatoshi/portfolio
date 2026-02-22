import {
  type ExternalKey,
  type IdentityClaims,
  newUserId,
  type UserId,
  type UserIdentityResolver,
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
export class PrismaUserIdentityStore implements UserIdentityResolver {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Look up an existing user id by OIDC issuer/subject pair.
   */
  findUserIdByExternalKey(
    input: ExternalKey,
  ): ResultAsync<null | UserId, RichError> {
    return ResultAsync.fromPromise(
      this.db.userIdentity.findUnique({
        select: { userId: true },
        where: {
          issuer_subject: {
            issuer: input.issuer,
            subject: input.subject,
          },
        },
      }),
      (cause) =>
        newPrismaError({
          cause,
          details: {
            action: "FindUserByIssuerSubject",
          },
        }),
    ).andThen((row) =>
      row ? parseUserId(row.userId, "FindUserByIssuerSubject") : okAsync(null),
    );
  }

  /**
   * Resolve an internal user id for the given identity.
   *
   * - Existing identity -> returns mapped user id.
   * - New identity -> links/creates user by verified email.
   */
  resolveUserId(input: IdentityClaims): ResultAsync<UserId, RichError> {
    return this.findUserIdByExternalKey(input).andThen((existingUserId) => {
      if (existingUserId) return okAsync(existingUserId);
      return this.linkByVerifiedEmail(input);
    });
  }

  private linkByVerifiedEmail(
    input: IdentityClaims,
  ): ResultAsync<UserId, RichError> {
    if (!input.email || !input.emailVerified) {
      return errAsync(
        newRichError({
          code: "PRISMA_USER_IDENTITY_EMAIL_UNVERIFIED",
          details: {
            action: "LinkUserIdentity",
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
      this.db.userIdentity.upsert({
        create: {
          issuer: input.issuer,
          subject: input.subject,
          user: {
            connectOrCreate: {
              create: {
                email: input.email,
                ...(input.name ? { name: input.name } : {}),
                ...(input.image ? { image: input.image } : {}),
              },
              where: {
                email: input.email,
              },
            },
          },
        },
        select: { userId: true },
        update: {},
        where: {
          issuer_subject: {
            issuer: input.issuer,
            subject: input.subject,
          },
        },
      }),
      (cause) =>
        newPrismaError({
          cause,
          details: {
            action: "LinkUserIdentity",
          },
        }),
    )
      .andThen((row) => parseUserId(row.userId, "LinkUserIdentity"))
      .orElse((error) => {
        if (error.code !== "PRISMA_P2002_UNIQUE_CONSTRAINT") {
          return errAsync(error);
        }

        // A concurrent request may have linked the same issuer/subject first.
        // Retry by reading the canonical mapping and return it when available.
        return this.findUserIdByExternalKey(input).andThen((userId) =>
          userId ? okAsync(userId) : errAsync(error),
        );
      });
  }
}

function parseUserId(
  rawUserId: string,
  action: string,
): ResultAsync<UserId, RichError> {
  const parsed = newUserId(rawUserId);
  if (parsed.isOk()) {
    return okAsync(parsed.value);
  }
  return errAsync(
    newRichError({
      cause: parsed.error,
      code: "PRISMA_USER_IDENTITY_USER_ID_INVALID",
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
