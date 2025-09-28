[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / DeleteTransactionUseCase

# Class: DeleteTransactionUseCase

Defined in: [packages/application/src/use-cases/user/delete-transaction.ts:7](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/delete-transaction.ts#L7)

## Constructors

### Constructor

> **new DeleteTransactionUseCase**(`repo`): `DeleteTransactionUseCase`

Defined in: [packages/application/src/use-cases/user/delete-transaction.ts:8](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/delete-transaction.ts#L8)

#### Parameters

##### repo

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md)

#### Returns

`DeleteTransactionUseCase`

## Methods

### execute()

> **execute**(`req`): `ResultAsync`\<`void`, `Error`\>

Defined in: [packages/application/src/use-cases/user/delete-transaction.ts:10](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/application/src/use-cases/user/delete-transaction.ts#L10)

#### Parameters

##### req

###### id

`string` = `...`

###### userId

`string` = `...`

#### Returns

`ResultAsync`\<`void`, `Error`\>
