[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / GetTransactionsUseCase

# Class: GetTransactionsUseCase

Defined in: [packages/application/src/use-cases/user/get-transactions.ts:15](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/application/src/use-cases/user/get-transactions.ts#L15)

Use case that fetches all transactions for a given user while enforcing
ownership validation.

## Constructors

### Constructor

> **new GetTransactionsUseCase**(`repo`): `GetTransactionsUseCase`

Defined in: [packages/application/src/use-cases/user/get-transactions.ts:16](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/application/src/use-cases/user/get-transactions.ts#L16)

#### Parameters

##### repo

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md)

#### Returns

`GetTransactionsUseCase`

## Methods

### execute()

> **execute**(`req`): `ResultAsync`\<[`GetTransactionsResponse`](../type-aliases/GetTransactionsResponse.md), `Error`\>

Defined in: [packages/application/src/use-cases/user/get-transactions.ts:24](https://github.com/o3osatoshi/experiment/blob/67ff251451cab829206391b718d971ec20ce4dfb/packages/application/src/use-cases/user/get-transactions.ts#L24)

Validate the user identifier and load transactions from the repository.

#### Parameters

##### req

Normalized request identifying the transaction owner.

###### userId

`string` = `...`

#### Returns

`ResultAsync`\<[`GetTransactionsResponse`](../type-aliases/GetTransactionsResponse.md), `Error`\>

ResultAsync with a list of DTOs or a structured error.
