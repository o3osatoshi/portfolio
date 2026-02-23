/** Stable error codes for external identity persistence operations. */
export const externalIdentityErrorCodes = {
  EMAIL_UNVERIFIED: "PRISMA_EXTERNAL_IDENTITY_EMAIL_UNVERIFIED",
  USER_ID_INVALID: "PRISMA_EXTERNAL_IDENTITY_USER_ID_INVALID",
} as const;

/** Union type for external identity persistence error codes. */
export type ExternalIdentityErrorCode =
  (typeof externalIdentityErrorCodes)[keyof typeof externalIdentityErrorCodes];
