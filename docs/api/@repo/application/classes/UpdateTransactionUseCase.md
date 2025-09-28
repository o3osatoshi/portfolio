[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / UpdateTransactionUseCase

# Class: UpdateTransactionUseCase

Defined in: [packages/application/src/use-cases/user/update-transaction.ts:11](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/update-transaction.ts#L11)

## Constructors

### Constructor

> **new UpdateTransactionUseCase**(`repo`): `UpdateTransactionUseCase`

Defined in: [packages/application/src/use-cases/user/update-transaction.ts:12](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/update-transaction.ts#L12)

#### Parameters

##### repo

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md)

#### Returns

`UpdateTransactionUseCase`

## Methods

### execute()

> **execute**(`req`, `userId`): `ResultAsync`\<`void`, `Error`\>

Defined in: [packages/application/src/use-cases/user/update-transaction.ts:14](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/update-transaction.ts#L14)

#### Parameters

##### req

###### amount?

`string` = `...`

###### currency?

`string` = `...`

###### datetime?

`Date` = `...`

###### fee?

`string` = `...`

###### feeCurrency?

`string` = `...`

###### id

`string` = `...`

###### price?

`string` = `...`

###### profitLoss?

`string` = `...`

###### type?

`"BUY"` \| `"SELL"` = `...`

##### userId

`string`

#### Returns

`ResultAsync`\<`void`, `Error`\>
