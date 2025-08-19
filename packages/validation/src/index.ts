import { z } from "zod";

export const UserSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().min(0).max(130).optional(),
});

export type User = z.infer<typeof UserSchema>;

export function validateUser(input: unknown): User {
  return UserSchema.parse(input);
}
