import { buildEdgeHandler } from "@repo/interface/http/edge";

export const runtime = "edge";

export const { GET, POST } = buildEdgeHandler({});
