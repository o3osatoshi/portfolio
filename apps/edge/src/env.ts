import { z } from "zod";

import { createEnv } from "@o3osatoshi/toolkit";

export const env = createEnv(
  {
    AUTH_SECRET: z.string().min(1),
  },
  { name: "edge" },
);
