import { z } from "zod";

/** ISO 8601 date-time string. */
export const isoDateStringSchema = z.string();
/** @public */
export type ISODateString = z.infer<typeof isoDateStringSchema>;

/** Base user object emitted by Hono session state. */
export const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});
/** @public */
export type User = z.infer<typeof userSchema>;

/** Auth.js adapter user shape with required email and verification timestamp. */
export const adapterUserSchema = userSchema.extend({
  email: z.string(),
  emailVerified: z.date().nullable(),
});
/** @public */
export type AdapterUser = z.infer<typeof adapterUserSchema>;

/** Decoded JWT payload shape used by auth session/state handling. */
export const jwtSchema = z.object({
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  exp: z.number().optional(),
  iat: z.number().optional(),
  jti: z.string().optional(),
  picture: z.string().nullable().optional(),
  sub: z.string().optional(),
});
/** @public */
export type JWT = z.infer<typeof jwtSchema>;

/** Session envelope used by auth middleware. */
export const sessionSchema = z.object({
  expires: isoDateStringSchema,
  user: userSchema.optional(),
});
/** @public */
export type Session = z.infer<typeof sessionSchema>;

/** Combined auth payload exposed to request handlers. */
export const authUserSchema = z.object({
  session: sessionSchema,
  token: jwtSchema.optional(),
  user: adapterUserSchema.optional(),
});
/** @public */
export type AuthUser = z.infer<typeof authUserSchema>;

/** Sign-in redirect options.
 *
 * Includes only optional redirect destination to keep callers explicit.
 */
export const signInOptionsSchema = z.object({
  redirectTo: z.string().optional(),
});
/** @public */
export type SignInOptions = z.infer<typeof signInOptionsSchema>;

/** Sign-out options.
 *
 * Includes optional post-signout redirect destination.
 */
export const signOutOptionsSchema = z.object({
  redirectTo: z.string().optional(),
});
/** @public */
export type SignOutOptions = z.infer<typeof signOutOptionsSchema>;

/** Supported auth provider ids for this package. */
export const authProviderIdSchema = z.enum(["oidc"]);
/** @public */
export type AuthProviderId = z.infer<typeof authProviderIdSchema>;

export type { AuthConfig } from "@hono/auth-js";
