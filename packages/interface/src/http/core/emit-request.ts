import type { Attributes, RequestLogger } from "@o3osatoshi/logging";
import { toRichError } from "@o3osatoshi/toolkit";

export function emitRequestSummary(
  requestLogger: RequestLogger,
  status: number,
  durationMs: number,
  error?: unknown,
) {
  const attributes: Attributes = {
    "http.response.duration_ms": Math.max(0, durationMs),
    "http.status_code": status,
  };
  attachErrorAttributes(attributes, error);

  const isSuccess = status < 400;
  const isClientError = status >= 400 && status < 500;
  const isServerError = status >= 500;

  if (isSuccess) {
    requestLogger.logger.info("http_request_success", attributes);
  }
  if (isClientError) {
    requestLogger.logger.warn("http_request_error", attributes);
  }
  if (isServerError) {
    requestLogger.logger.error("http_request_error", attributes, error);
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

function attachErrorAttributes(attributes: Attributes, error?: unknown) {
  if (!error) return;

  const rich = toRichError(error);
  if (rich.code) attributes["error.code"] = rich.code;
  attributes["error.kind"] = rich.kind;
  attributes["error.layer"] = rich.layer;

  const reason = rich.details?.reason;
  if (typeof reason === "string" && reason.length > 0) {
    attributes["error.reason"] = reason;
  }
}
