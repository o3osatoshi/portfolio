import { z } from "zod";

import { createEnv } from "@o3osatoshi/toolkit";

export const env = createEnv(
  {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },
  { name: "web:server" },
);
