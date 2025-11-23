import { z } from "zod";

import { createEnv } from "@o3osatoshi/toolkit";

export const env = createEnv(
  {
    NEXT_PUBLIC_API_BASE_URL: z.url(),
    NEXT_PUBLIC_RAINBOW_PROJECT_ID: z.string().min(1),
  },
  {
    name: "web:client",
    source: {
      NEXT_PUBLIC_API_BASE_URL: process.env["NEXT_PUBLIC_API_BASE_URL"],
      NEXT_PUBLIC_RAINBOW_PROJECT_ID:
        process.env["NEXT_PUBLIC_RAINBOW_PROJECT_ID"],
    },
  },
);
