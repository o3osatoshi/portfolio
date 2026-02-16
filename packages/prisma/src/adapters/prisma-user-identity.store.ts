import { errAsync, okAsync, ResultAsync } from "neverthrow";

import { newRichError, type RichError } from "@o3osatoshi/toolkit";

import type { PrismaClient } from "../prisma-client";
import { newPrismaError } from "../prisma-error";

type FindUserByIdentityInput = {
  issuer: string;
  subject: string;
};

type ResolveUserByIdentityInput = {
  email?: string | undefined;
  emailVerified: boolean;
  image?: string | undefined;
  name?: string | undefined;
} & FindUserByIdentityInput;

/**
 * Identity-backed user resolution for CLI access tokens.
 *
 * The store keeps `issuer + subject` as the primary lookup key and only falls
 * back to verified email when first linking a user.
 */
export class PrismaUserIdentityStore {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Look up an existing user id by OIDC issuer/subject pair.
   */
  findUserIdByIssuerSubject(
    input: FindUserByIdentityInput,
  ): ResultAsync<null | string, RichError> {
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
    ).map((row) => row?.userId ?? null);
  }

  /**
   * Resolve an internal user id for the given identity.
   *
   * - Existing identity -> returns mapped user id.
   * - New identity -> links/creates user by verified email.
   */
  resolveUserId(
    input: ResolveUserByIdentityInput,
  ): ResultAsync<string, RichError> {
    return this.findUserIdByIssuerSubject(input).andThen((existingUserId) => {
      if (existingUserId) return okAsync(existingUserId);
      return this.linkByVerifiedEmail(input);
    });
  }

  private linkByVerifiedEmail(
    input: ResolveUserByIdentityInput,
  ): ResultAsync<string, RichError> {
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
      this.db.userIdentity
        .upsert({
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
        })
        .then((row) => row.userId),
      (cause) =>
        newPrismaError({
          cause,
          details: {
            action: "LinkUserIdentity",
          },
        }),
    );
  }
}
