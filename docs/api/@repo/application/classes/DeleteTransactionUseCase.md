[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / DeleteTransactionUseCase

# Class: DeleteTransactionUseCase

Defined in: [packages/application/src/use-cases/user/delete-transaction.ts:10](https://github.com/o3osatoshi/experiment/blob/54ab00df974a3e9f8283fbcd8c611ed1e0274132/packages/application/src/use-cases/user/delete-transaction.ts#L10)

Use case encapsulating the deletion of a transaction for a given user.

## Constructors

### Constructor

> **new DeleteTransactionUseCase**(`repo`): `DeleteTransactionUseCase`

Defined in: [packages/application/src/use-cases/user/delete-transaction.ts:11](https://github.com/o3osatoshi/experiment/blob/54ab00df974a3e9f8283fbcd8c611ed1e0274132/packages/application/src/use-cases/user/delete-transaction.ts#L11)

#### Parameters

##### repo

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md)

#### Returns

`DeleteTransactionUseCase`

## Methods

### execute()

> **execute**(`req`): `ResultAsync`\<`void`, `Error`\>

Defined in: [packages/application/src/use-cases/user/delete-transaction.ts:19](https://github.com/o3osatoshi/experiment/blob/54ab00df974a3e9f8283fbcd8c611ed1e0274132/packages/application/src/use-cases/user/delete-transaction.ts#L19)

Validate identifiers and delegate deletion to the persistence layer.

#### Parameters

##### req

Normalized request containing transaction and user identifiers.

###### id

`string` = `...`

###### userId

`string` = `...`

#### Returns

`ResultAsync`\<`void`, `Error`\>

ResultAsync that resolves when the transaction is removed.
