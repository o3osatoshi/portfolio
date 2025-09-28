[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / GetAuthenticatorAggregateType

# Type Alias: GetAuthenticatorAggregateType\<T\>

> **GetAuthenticatorAggregateType**\<`T`\> = \{ \[P in keyof T & keyof AggregateAuthenticator\]: P extends "\_count" \| "count" ? T\[P\] extends true ? number : GetScalarType\<T\[P\], AggregateAuthenticator\[P\]\> : GetScalarType\<T\[P\], AggregateAuthenticator\[P\]\> \}

Defined in: packages/prisma/generated/prisma/models/Authenticator.ts:174

## Type Parameters

### T

`T` *extends* [`AuthenticatorAggregateArgs`](AuthenticatorAggregateArgs.md)
