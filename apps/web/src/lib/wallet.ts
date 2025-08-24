import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { holesky } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
if (projectId === undefined) {
  throw new Error("NEXT_PUBLIC_PROJECT_ID is undefined");
}

export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  projectId,
  chains: [holesky],
  transports: {
    [holesky.id]: http(),
  },
  ssr: true,
});
