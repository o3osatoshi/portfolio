import { z } from "zod";

import { createEnv } from "@o3osatoshi/toolkit";

export const env = createEnv(
  {
    ETHERSCAN_API_KEY: z.string().min(1),
  },
  { name: "eth" },
);
