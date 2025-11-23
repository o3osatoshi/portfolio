[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / UpdateTransactionUseCase

# Class: UpdateTransactionUseCase

Defined in: [packages/application/src/use-cases/user/update-transaction.ts:15](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/application/src/use-cases/user/update-transaction.ts#L15)

Use case that coordinates ownership checks and domain validation before
applying updates to an existing transaction.

## Constructors

### Constructor

> **new UpdateTransactionUseCase**(`repo`): `UpdateTransactionUseCase`

Defined in: [packages/application/src/use-cases/user/update-transaction.ts:16](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/application/src/use-cases/user/update-transaction.ts#L16)

#### Parameters

##### repo

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md)

#### Returns

`UpdateTransactionUseCase`

## Methods

### execute()

> **execute**(`req`, `userId`): `ResultAsync`\<`void`, `Error`\>

Defined in: [packages/application/src/use-cases/user/update-transaction.ts:26](https://github.com/o3osatoshi/experiment/blob/17b936c4e1e126fcc250189262f9067740a67220/packages/application/src/use-cases/user/update-transaction.ts#L26)

Validate identifiers, ensure ownership, apply domain updates, and persist
the patched transaction entity.

#### Parameters

##### req

Normalized update payload supplied by the application layer.

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

Authenticated user identifier used for authorization.

#### Returns

`ResultAsync`\<`void`, `Error`\>

ResultAsync that resolves when the transaction is updated.
