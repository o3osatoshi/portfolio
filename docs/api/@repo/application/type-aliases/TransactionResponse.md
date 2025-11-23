[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / TransactionResponse

# Type Alias: TransactionResponse

> **TransactionResponse** = `object`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:19](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L19)

DTO exposed by the application layer for transaction entities.

Dates stay as `Date` to preserve timezone awareness and decimal values remain
normalized strings so consumers can choose their own numeric formatting.

## Properties

### amount

> **amount**: `string`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:20](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L20)

***

### createdAt

> **createdAt**: `Date`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:21](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L21)

***

### currency

> **currency**: `string`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:22](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L22)

***

### datetime

> **datetime**: `Date`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:23](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L23)

***

### fee?

> `optional` **fee**: `string`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:24](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L24)

***

### feeCurrency?

> `optional` **feeCurrency**: `string`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:25](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L25)

***

### id

> **id**: `string`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:26](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L26)

***

### price

> **price**: `string`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:27](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L27)

***

### profitLoss?

> `optional` **profitLoss**: `string`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:28](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L28)

***

### type

> **type**: `"BUY"` \| `"SELL"`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:29](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L29)

***

### updatedAt

> **updatedAt**: `Date`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:30](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L30)

***

### userId

> **userId**: `string`

Defined in: [packages/application/src/dtos/transaction.res.dto.ts:31](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/application/src/dtos/transaction.res.dto.ts#L31)
