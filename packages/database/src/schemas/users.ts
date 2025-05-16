import { z } from "zod";
import { zBase } from "./common";

export const zUser = zBase.extend({
  id: z.string(),
  name: z.string().optional(),
  email: z.string().email(),
  emailVerified: z.coerce.date().optional(),
  image: z.string().url().optional(),
});
