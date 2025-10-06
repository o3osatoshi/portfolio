[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / CreateTransactionUseCase

# Class: CreateTransactionUseCase

Defined in: [packages/application/src/use-cases/user/create-transaction.ts:14](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/application/src/use-cases/user/create-transaction.ts#L14)

Use case responsible for validating and persisting a new transaction for a user.

## Constructors

### Constructor

> **new CreateTransactionUseCase**(`repo`): `CreateTransactionUseCase`

Defined in: [packages/application/src/use-cases/user/create-transaction.ts:15](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/application/src/use-cases/user/create-transaction.ts#L15)

#### Parameters

##### repo

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md)

#### Returns

`CreateTransactionUseCase`

## Methods

### execute()

> **execute**(`req`): `ResultAsync`\<[`TransactionResponse`](../type-aliases/TransactionResponse.md), `Error`\>

Defined in: [packages/application/src/use-cases/user/create-transaction.ts:24](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/application/src/use-cases/user/create-transaction.ts#L24)

Validate the inbound request, persist the transaction, and convert the
domain entity into a DTO-friendly response.

#### Parameters

##### req

Normalized request payload from the application layer.

###### amount

`string` = `PositiveDecimalSchema`

###### currency

`string` = `...`

###### datetime

`Date` = `...`

###### fee?

`string` = `...`

###### feeCurrency?

`string` = `...`

###### price

`string` = `PositiveDecimalSchema`

###### profitLoss?

`string` = `...`

###### type

`"BUY"` \| `"SELL"` = `...`

###### userId

`string` = `...`

#### Returns

`ResultAsync`\<[`TransactionResponse`](../type-aliases/TransactionResponse.md), `Error`\>

ResultAsync wrapping the created transaction DTO or a structured error.
