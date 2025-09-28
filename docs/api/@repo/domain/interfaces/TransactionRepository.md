[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/domain](../README.md) / TransactionRepository

# Interface: TransactionRepository

Defined in: [ports/transaction.repository.ts:6](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/domain/src/ports/transaction.repository.ts#L6)

## Methods

### create()

> **create**(`tx`): `ResultAsync`\<[`Transaction`](../type-aliases/Transaction.md), `Error`\>

Defined in: [ports/transaction.repository.ts:7](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/domain/src/ports/transaction.repository.ts#L7)

#### Parameters

##### tx

[`CreateTransaction`](../type-aliases/CreateTransaction.md)

#### Returns

`ResultAsync`\<[`Transaction`](../type-aliases/Transaction.md), `Error`\>

***

### delete()

> **delete**(`id`, `userId`): `ResultAsync`\<`void`, `Error`\>

Defined in: [ports/transaction.repository.ts:8](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/domain/src/ports/transaction.repository.ts#L8)

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

Defined in: [ports/transaction.repository.ts:9](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/domain/src/ports/transaction.repository.ts#L9)

#### Parameters

##### id

[`TransactionId`](../type-aliases/TransactionId.md)

#### Returns

`ResultAsync`\<`null` \| [`Transaction`](../type-aliases/Transaction.md), `Error`\>

***

### findByUserId()

> **findByUserId**(`userId`): `ResultAsync`\<[`Transaction`](../type-aliases/Transaction.md)[], `Error`\>

Defined in: [ports/transaction.repository.ts:10](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/domain/src/ports/transaction.repository.ts#L10)

#### Parameters

##### userId

[`UserId`](../type-aliases/UserId.md)

#### Returns

`ResultAsync`\<[`Transaction`](../type-aliases/Transaction.md)[], `Error`\>

***

### update()

> **update**(`tx`): `ResultAsync`\<`void`, `Error`\>

Defined in: [ports/transaction.repository.ts:11](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/domain/src/ports/transaction.repository.ts#L11)

#### Parameters

##### tx

[`Transaction`](../type-aliases/Transaction.md)

#### Returns

`ResultAsync`\<`void`, `Error`\>
