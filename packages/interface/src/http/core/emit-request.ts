import type { RequestLogger } from "@o3osatoshi/logging";

export function emitRequestEnd(
  requestLogger: RequestLogger,
  status: number,
  durationMs: number,
  error?: unknown,
) {
  const attributes = {
    "http.response.duration_ms": Math.max(0, durationMs),
    "http.status_code": status,
  };

  if (error) {
    requestLogger.logger.error("http_request_error", attributes, error);
  } else {
    requestLogger.logger.info("http_request_success", attributes);
  }

  requestLogger.logger.metric(
    "http.server.requests",
    1,
    { "http.status_code": status },
    { kind: "counter", unit: "1" },
  );
  requestLogger.logger.metric(
    "http.server.request.duration",
    Math.max(0, durationMs),
    { "http.status_code": status },
    { kind: "histogram", unit: "ms" },
  );
}

export function emitRequestStart(requestLogger: RequestLogger) {
  requestLogger.logger.info("http_request_start");
}
