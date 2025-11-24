[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/auth](../README.md) / authUserSchema

# Variable: authUserSchema

> `const` **authUserSchema**: `ZodObject`\<\{ `session`: `ZodObject`\<\{ `expires`: `ZodString`; `user`: `ZodOptional`\<`ZodObject`\<\{ `email`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; `id`: `ZodString`; `image`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; `name`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; \}, `$strip`\>\>; \}, `$strip`\>; `token`: `ZodOptional`\<`ZodObject`\<\{ `email`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; `exp`: `ZodOptional`\<`ZodNumber`\>; `iat`: `ZodOptional`\<`ZodNumber`\>; `jti`: `ZodOptional`\<`ZodString`\>; `name`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; `picture`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; `sub`: `ZodOptional`\<`ZodString`\>; \}, `$strip`\>\>; `user`: `ZodOptional`\<`ZodObject`\<\{ `email`: `ZodString`; `emailVerified`: `ZodNullable`\<`ZodDate`\>; `id`: `ZodString`; `image`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; `name`: `ZodOptional`\<`ZodNullable`\<`ZodString`\>\>; \}, `$strip`\>\>; \}, `$strip`\>

Defined in: [packages/auth/src/hono-auth/types.ts:37](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/auth/src/hono-auth/types.ts#L37)
