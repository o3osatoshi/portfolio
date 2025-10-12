import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { http } from "wagmi";
import { holesky } from "wagmi/chains";

const projectId = process.env["NEXT_PUBLIC_RAINBOW_PROJECT_ID"];
if (projectId === undefined) {
  throw new Error("NEXT_PUBLIC_RAINBOW_PROJECT_ID is undefined");
}

export const config = getDefaultConfig({
  appName: "RainbowKit demo",
  chains: [holesky],
  projectId,
  ssr: true,
  transports: {
    [holesky.id]: http(),
  },
});
