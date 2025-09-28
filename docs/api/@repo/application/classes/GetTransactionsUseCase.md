[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / GetTransactionsUseCase

# Class: GetTransactionsUseCase

Defined in: [packages/application/src/use-cases/user/get-transactions.ts:11](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/get-transactions.ts#L11)

## Constructors

### Constructor

> **new GetTransactionsUseCase**(`repo`): `GetTransactionsUseCase`

Defined in: [packages/application/src/use-cases/user/get-transactions.ts:12](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/get-transactions.ts#L12)

#### Parameters

##### repo

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md)

#### Returns

`GetTransactionsUseCase`

## Methods

### execute()

> **execute**(`req`): `ResultAsync`\<[`GetTransactionsResponse`](../type-aliases/GetTransactionsResponse.md), `Error`\>

Defined in: [packages/application/src/use-cases/user/get-transactions.ts:14](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/get-transactions.ts#L14)

#### Parameters

##### req

###### userId

`string` = `...`

#### Returns

`ResultAsync`\<[`GetTransactionsResponse`](../type-aliases/GetTransactionsResponse.md), `Error`\>
