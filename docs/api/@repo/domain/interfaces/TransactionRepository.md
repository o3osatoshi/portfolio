[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/domain](../README.md) / TransactionRepository

# Interface: TransactionRepository

Defined in: [ports/transaction.repository.ts:9](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/domain/src/ports/transaction.repository.ts#L9)

Port describing persistence operations required by transaction use cases.

## Methods

### create()

> **create**(`tx`): `ResultAsync`\<[`Transaction`](../type-aliases/Transaction.md), `Error`\>

Defined in: [ports/transaction.repository.ts:11](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/domain/src/ports/transaction.repository.ts#L11)

Persist a newly created transaction and return the stored entity.

#### Parameters

##### tx

[`CreateTransaction`](../type-aliases/CreateTransaction.md)

#### Returns

`ResultAsync`\<[`Transaction`](../type-aliases/Transaction.md), `Error`\>

***

### delete()

> **delete**(`id`, `userId`): `ResultAsync`\<`void`, `Error`\>

Defined in: [ports/transaction.repository.ts:13](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/domain/src/ports/transaction.repository.ts#L13)

Remove a transaction if it belongs to the provided user.

#### Parameters

##### id

[`TransactionId`](../type-aliases/TransactionId.md)

##### userId

[`UserId`](../type-aliases/UserId.md)

#### Returns

`ResultAsync`\<`void`, `Error`\>

***

### findById()

> **findById**(`id`): `ResultAsync`\<`null` \| [`Transaction`](../type-aliases/Transaction.md), `Error`\>

Defined in: [ports/transaction.repository.ts:15](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/domain/src/ports/transaction.repository.ts#L15)

Lookup a transaction by its identifier.

#### Parameters

##### id

[`TransactionId`](../type-aliases/TransactionId.md)

#### Returns

`ResultAsync`\<`null` \| [`Transaction`](../type-aliases/Transaction.md), `Error`\>

***

### findByUserId()

> **findByUserId**(`userId`): `ResultAsync`\<[`Transaction`](../type-aliases/Transaction.md)[], `Error`\>

Defined in: [ports/transaction.repository.ts:17](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/domain/src/ports/transaction.repository.ts#L17)

List all transactions associated with a user.

#### Parameters

##### userId

[`UserId`](../type-aliases/UserId.md)

#### Returns

`ResultAsync`\<[`Transaction`](../type-aliases/Transaction.md)[], `Error`\>

***

### update()

> **update**(`tx`): `ResultAsync`\<`void`, `Error`\>

Defined in: [ports/transaction.repository.ts:19](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/domain/src/ports/transaction.repository.ts#L19)

Apply updates to an existing transaction.

#### Parameters

##### tx

[`Transaction`](../type-aliases/Transaction.md)

#### Returns

`ResultAsync`\<`void`, `Error`\>
