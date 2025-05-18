import { defineConfig } from "@wagmi/cli";
import { etherscan } from "@wagmi/cli/plugins";
import { erc20Abi } from "viem";
import { mainnet } from "wagmi/chains";

const apiKey = process.env.ETHERSCAN_API_KEY;
if (apiKey === undefined) {
  throw new Error("ETHERSCAN_API_KEY is not set");
}

export default defineConfig({
  out: "src/generated.ts",
  contracts: [
    {
      name: "erc20",
      abi: erc20Abi,
    },
  ],
  plugins: [
    etherscan({
      apiKey,
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
