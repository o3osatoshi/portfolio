import { z } from "zod";

export const isoDateStringSchema = z.string();
export type ISODateString = z.infer<typeof isoDateStringSchema>;

export const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  image: z.string().nullable().optional(),
});
export type User = z.infer<typeof userSchema>;

export const adapterUserSchema = userSchema.extend({
  email: z.string(),
  emailVerified: z.date().nullable(),
});
export type AdapterUser = z.infer<typeof adapterUserSchema>;

export const jwtSchema = z.object({
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  exp: z.number().optional(),
  iat: z.number().optional(),
  jti: z.string().optional(),
  picture: z.string().nullable().optional(),
  sub: z.string().optional(),
});
export type JWT = z.infer<typeof jwtSchema>;

export const sessionSchema = z.object({
  expires: isoDateStringSchema,
  user: userSchema.optional(),
});
export type Session = z.infer<typeof sessionSchema>;

export const authUserSchema = z.object({
  session: sessionSchema,
  token: jwtSchema.optional(),
  user: adapterUserSchema.optional(),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const signInOptionsSchema = z.object({
  redirectTo: z.string().optional(),
});
export type SignInOptions = z.infer<typeof signInOptionsSchema>;

export const signOutOptionsSchema = z.object({
  redirectTo: z.string().optional(),
});
export type SignOutOptions = z.infer<typeof signOutOptionsSchema>;

export const authProviderIdSchema = z.enum(["oidc"]);
export type AuthProviderId = z.infer<typeof authProviderIdSchema>;

export type { AuthConfig } from "@hono/auth-js";
