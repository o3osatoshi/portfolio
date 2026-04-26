[**@o3osatoshi/toolkit**](../README.md)

***

[@o3osatoshi/toolkit](../README.md) / OmitUndefinedDeep

# Type Alias: OmitUndefinedDeep\<T\>

> **OmitUndefinedDeep**\<`T`\> = `T` *extends* (...`args`) => `unknown` \| `bigint` \| `boolean` \| `Date` \| `Error` \| `Map`\<`unknown`, `unknown`\> \| `null` \| `number` \| `Promise`\<`unknown`\> \| `ReadonlyMap`\<`unknown`, `unknown`\> \| `ReadonlySet`\<`unknown`\> \| `RegExp` \| `Set`\<`unknown`\> \| `string` \| `symbol` \| `WeakMap`\<`object`, `unknown`\> \| `WeakSet`\<`object`\> ? `Exclude`\<`T`, `undefined`\> : `T` *extends* readonly `unknown`[] ? `T` : `T` *extends* `Record`\<`string`, `unknown`\> ? `{ [K in keyof T as undefined extends T[K] ? K : never]?: OmitUndefinedDeep<Exclude<T[K], undefined>> }` & `{ [K in keyof T as undefined extends T[K] ? never : K]: OmitUndefinedDeep<T[K]> }` : `Exclude`\<`T`, `undefined`\>

Defined in: [packages/toolkit/src/omit-undefined.ts:12](https://github.com/o3osatoshi/portfolio/blob/81b48315442851c7695fbbb46738673e2699634a/packages/toolkit/src/omit-undefined.ts#L12)

Recursively removes `undefined` from object value types.

## Type Parameters

### T

`T`

## Remarks

- Keys whose value type can be `undefined` become optional.
- Arrays and non-plain object-like values are preserved as-is.
