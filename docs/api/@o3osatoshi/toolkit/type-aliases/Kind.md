[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@o3osatoshi/toolkit](../README.md) / Kind

# Type Alias: Kind

> **Kind** = `"BadGateway"` \| `"BadRequest"` \| `"Canceled"` \| `"Config"` \| `"Conflict"` \| `"Deadlock"` \| `"Forbidden"` \| `"Integrity"` \| `"MethodNotAllowed"` \| `"NotFound"` \| `"RateLimit"` \| `"Serialization"` \| `"Timeout"` \| `"Unauthorized"` \| `"Unavailable"` \| `"Unknown"` \| `"Unprocessable"` \| `"Validation"`

Defined in: [error/error.ts:29](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/toolkit/src/error/error.ts#L29)

Generic error classifications shared across application layers.

Recommended meanings (and default HTTP mappings used by `toHttpErrorResponse()`):
- `"BadGateway"` → upstream dependency returned an invalid/5xx response (502).
- `"BadRequest"` → malformed payload or invalid query before validation (400).
- `"Canceled"` → caller canceled or aborted the request (408).
- `"Config"` → server-side misconfiguration detected (500).
- `"Conflict"` → state/version mismatch such as optimistic locking (409).
- `"Deadlock"` → concurrency deadlock detected by the data store (409).
- `"Forbidden"` → authenticated caller lacks permission (403).
- `"Integrity"` → constraint violations such as unique/index failures (409).
- `"MethodNotAllowed"` → HTTP verb not supported for the resource (405).
- `"NotFound"` → entity or route missing (404).
- `"RateLimit"` → throttling or quota exceeded (429).
- `"Serialization"` → encode/decode failures (500).
- `"Timeout"` → upstream or local job timed out (504).
- `"Unauthorized"` → authentication missing or invalid (401).
- `"Unavailable"` → dependency or subsystem temporarily down (503).
- `"Unknown"` → fallback for uncategorized errors (500).
- `"Unprocessable"` → semantically invalid input even though syntactically valid (422).
- `"Validation"` → domain/application validation error (400).
