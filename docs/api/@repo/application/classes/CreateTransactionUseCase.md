[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / CreateTransactionUseCase

# Class: CreateTransactionUseCase

Defined in: [packages/application/src/use-cases/user/create-transaction.ts:11](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/create-transaction.ts#L11)

## Constructors

### Constructor

> **new CreateTransactionUseCase**(`repo`): `CreateTransactionUseCase`

Defined in: [packages/application/src/use-cases/user/create-transaction.ts:12](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/create-transaction.ts#L12)

#### Parameters

##### repo

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md)

#### Returns

`CreateTransactionUseCase`

## Methods

### execute()

> **execute**(`req`): `ResultAsync`\<[`TransactionResponse`](../type-aliases/TransactionResponse.md), `Error`\>

Defined in: [packages/application/src/use-cases/user/create-transaction.ts:14](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/create-transaction.ts#L14)

#### Parameters

##### req

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
