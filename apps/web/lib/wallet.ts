import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { holesky, mainnet } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (projectId === undefined) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is undefined");
}

export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId,
  chains: [mainnet, holesky],
  transports: {
    [mainnet.id]: http(),
    [holesky.id]: http(),
  },
  ssr: true,
});
