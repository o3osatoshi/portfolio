[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / composeErrorName

# Function: composeErrorName()

> **composeErrorName**(`layer`, `kind`): `string`

Defined in: [packages/toolkit/src/error/error.ts:119](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/error/error.ts#L119)

Build an error `name` string such as `DomainValidationError`.

## Parameters

### layer

`"Infrastructure"` | `"Application"` | `"Auth"` | `"Domain"` | `"External"` | `"Interface"` | `"Persistence"` | `"Presentation"`

### kind

`"Serialization"` | `"BadGateway"` | `"BadRequest"` | `"Canceled"` | `"Conflict"` | `"Forbidden"` | `"Internal"` | `"MethodNotAllowed"` | `"NotFound"` | `"RateLimit"` | `"Timeout"` | `"Unauthorized"` | `"Unavailable"` | `"Unprocessable"` | `"Validation"`

## Returns

`string`
