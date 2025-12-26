import { type LogEvent as AxiomLogEvent, EVENT } from "@axiomhq/logging";
import { describe, expect, it, vi } from "vitest";

import { createBridgeTransport, forwardLogEvent } from "./nextjs-shared";
import type { Logger } from "./types";

const createTestLogger = (): Logger => {
  const logger = {
    child: () => logger,
    debug: vi.fn(),
    error: vi.fn(),
    event: vi.fn(),
    flush: vi.fn().mockResolvedValue(undefined),
    info: vi.fn(),
    metric: vi.fn(),
    warn: vi.fn(),
  } as Logger;

  return logger;
};

describe("nextjs shared bridge", () => {
  it("forwards attributes and event fields into the logger", () => {
    const logger = createTestLogger();
    const event = {
      "@app": "app",
      _time: 123,
      [EVENT]: { trace_id: "trace-1" },
      fields: { "request.id": "req-1" },
      foo: "bar",
      level: "error",
      message: "oops",
      source: "nextjs",
    } as unknown as AxiomLogEvent;

    forwardLogEvent(logger, event);

    expect(logger.error).toHaveBeenCalledWith(
      "oops",
      expect.objectContaining({
        "request.id": "req-1",
        trace_id: "trace-1",
        "axiom.app": "app",
        "axiom.source": "nextjs",
        "axiom.time": 123,
        foo: "bar",
      }),
    );
  });

  it("skips events with level off", () => {
    const logger = createTestLogger();
    forwardLogEvent(logger, {
      level: "off",
      message: "noop",
    } as unknown as AxiomLogEvent);

    expect(logger.debug).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  it("bridges log batches and flush calls", async () => {
    const logger = createTestLogger();
    const transport = createBridgeTransport(logger);

    transport.log([
      { level: "info", message: "info" } as unknown as AxiomLogEvent,
    ]);
    await transport.flush?.();

    expect(logger.info).toHaveBeenCalledWith("info", expect.any(Object));
    expect(logger.flush).toHaveBeenCalledTimes(1);
  });
});
