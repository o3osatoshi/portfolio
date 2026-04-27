---
"@o3osatoshi/toolkit": minor
---

Reorganize the public error, HTTP, JSON, and validation helpers around `RichError`.

Add fetch response helpers, HTTP response builders/deserializers, URL redaction, rate-limit guards, object guards, typed `omitUndefined`, `trimTrailingSlash`, and abort signal resolution utilities.

Consumers should migrate from `newError` to `newRichError`, from `parseWith`/`parseAsyncWith` to `makeSchemaParser`, from `encode`/`decode` to `serialize`/`deserialize`, and from `deserializeError` to `deserializeRichError`.
