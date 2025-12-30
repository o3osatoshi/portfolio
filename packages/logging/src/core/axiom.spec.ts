import { beforeEach, describe, expect, it, vi } from "vitest";

import type { LogEvent } from "../types";
import { createAxiomClient, createAxiomTransport } from "./axiom";

const h = vi.hoisted(() => {
  const ingest = vi.fn();
  const flush = vi.fn().mockResolvedValue(undefined);
  const instances: Array<{ kind: "batch" | "immediate"; options: unknown }> =
    [];

  class Axiom {
    flush = flush;

    ingest = ingest;
    constructor(options: unknown) {
      instances.push({ kind: "batch", options });
    }
  }

  class AxiomWithoutBatching {
    ingest = ingest;

    constructor(options: unknown) {
      instances.push({ kind: "immediate", options });
    }
  }

  return { Axiom, AxiomWithoutBatching, flush, ingest, instances };
});

vi.mock("@axiomhq/js", () => ({
  Axiom: h.Axiom,
  AxiomWithoutBatching: h.AxiomWithoutBatching,
}));

describe("axiom helpers", () => {
  beforeEach(() => {
    h.ingest.mockReset();
    h.flush.mockReset();
    h.instances.length = 0;
  });

  it("creates batch and immediate clients based on mode", () => {
    createAxiomClient({ token: "token" });
    createAxiomClient({ mode: "immediate", token: "token" });

    expect(h.instances).toHaveLength(2);
    expect(h.instances[0]?.kind).toBe("batch");
    expect(h.instances[1]?.kind).toBe("immediate");
  });

  it("invokes onError when ingestion throws", () => {
    const onError = vi.fn();
    h.ingest.mockImplementationOnce(() => {
      throw new Error("boom");
    });

    const transport = createAxiomTransport({ onError, token: "token" });
    transport.emit("logs", { message: "oops", timestamp: "now" } as LogEvent);

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("invokes onError when ingestion rejects", async () => {
    const onError = vi.fn();
    h.ingest.mockReturnValueOnce(Promise.reject("nope"));

    const transport = createAxiomTransport({ onError, token: "token" });
    transport.emit("logs", { message: "oops", timestamp: "now" } as LogEvent);

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it("flushes only when the client supports it", async () => {
    const batchTransport = createAxiomTransport({ token: "token" });
    await batchTransport.flush?.();

    expect(h.flush).toHaveBeenCalledTimes(1);

    h.flush.mockClear();

    const immediateTransport = createAxiomTransport({
      mode: "immediate",
      token: "token",
    });
    await immediateTransport.flush?.();

    expect(h.flush).not.toHaveBeenCalled();
  });
});
