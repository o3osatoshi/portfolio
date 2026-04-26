[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / kindSchema

# Variable: kindSchema

> `const` **kindSchema**: `ZodEnum`\<\{ `BadGateway`: `"BadGateway"`; `BadRequest`: `"BadRequest"`; `Canceled`: `"Canceled"`; `Conflict`: `"Conflict"`; `Forbidden`: `"Forbidden"`; `Internal`: `"Internal"`; `MethodNotAllowed`: `"MethodNotAllowed"`; `NotFound`: `"NotFound"`; `RateLimit`: `"RateLimit"`; `Serialization`: `"Serialization"`; `Timeout`: `"Timeout"`; `Unauthorized`: `"Unauthorized"`; `Unavailable`: `"Unavailable"`; `Unprocessable`: `"Unprocessable"`; `Validation`: `"Validation"`; \}\>

Defined in: [packages/toolkit/src/error/error-schema.ts:27](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error-schema.ts#L27)

Generic error classifications shared across application layers.

Recommended meanings (and default HTTP mappings used by `toHttpErrorResponse()`):
- `"BadGateway"` → upstream dependency returned an invalid/5xx response (502).
- `"BadRequest"` → malformed payload or invalid query before validation (400).
- `"Canceled"` → caller canceled or aborted the request (408).
- `"Conflict"` → state/version mismatch such as optimistic locking (409).
- `"Forbidden"` → authenticated caller lacks permission (403).
- `"Internal"` → unexpected internal failure (500).
- `"MethodNotAllowed"` → HTTP verb not supported for the resource (405).
- `"NotFound"` → entity or route missing (404).
- `"RateLimit"` → throttling or quota exceeded (429).
- `"Serialization"` → serialize/deserialize failures (500).
- `"Timeout"` → upstream or local job timed out (504).
- `"Unauthorized"` → authentication missing or invalid (401).
- `"Unavailable"` → dependency or subsystem temporarily down (503).
- `"Unprocessable"` → semantically invalid input even though syntactically valid (422).
- `"Validation"` → domain/application validation error (400).
