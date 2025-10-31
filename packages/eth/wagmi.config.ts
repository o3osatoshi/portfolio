import { defineConfig } from "@wagmi/cli";
import { etherscan } from "@wagmi/cli/plugins";
import { erc20Abi } from "viem";
import { mainnet } from "wagmi/chains";

import { env } from "./src/env";

export default defineConfig({
  contracts: [
    {
      name: "erc20",
      abi: erc20Abi,
    },
  ],
  out: "src/generated.ts",
  plugins: [
    etherscan({
      apiKey: env.ETHERSCAN_API_KEY,
      chainId: mainnet.id,
      contracts: [
        {
          name: "WETH",
          address: {
            [mainnet.id]: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
          },
        },
      ],
    }),
  ],
});
