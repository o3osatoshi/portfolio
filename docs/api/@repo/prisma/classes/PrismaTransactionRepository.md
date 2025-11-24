[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/prisma](../README.md) / PrismaTransactionRepository

# Class: PrismaTransactionRepository

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:24](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/prisma/src/adapters/prisma-transaction.repository.ts#L24)

Prisma-backed implementation of the [TransactionRepository](../../domain/interfaces/TransactionRepository.md) port.
Maps domain value objects to Prisma primitives and normalizes errors.

## Implements

- [`TransactionRepository`](../../domain/interfaces/TransactionRepository.md)

## Constructors

### Constructor

> **new PrismaTransactionRepository**(`db`): `PrismaTransactionRepository`

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:25](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/prisma/src/adapters/prisma-transaction.repository.ts#L25)

#### Parameters

##### db

[`PrismaClient`](../type-aliases/PrismaClient.md) | [`TransactionClient`](../namespaces/Prisma/type-aliases/TransactionClient.md)

#### Returns

`PrismaTransactionRepository`

## Methods

### create()

> **create**(`tx`): `ResultAsync`\<[`Transaction`](../../domain/type-aliases/Transaction.md), `Error`\>

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:28](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/prisma/src/adapters/prisma-transaction.repository.ts#L28)

Persist a newly created transaction and return the stored entity.

#### Parameters

##### tx

[`CreateTransaction`](../../domain/type-aliases/CreateTransaction.md)

#### Returns

`ResultAsync`\<[`Transaction`](../../domain/type-aliases/Transaction.md), `Error`\>

#### Implementation of

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md).[`create`](../../domain/interfaces/TransactionRepository.md#create)

***

### delete()

> **delete**(`id`, `userId`): `ResultAsync`\<`void`, `Error`\>

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:43](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/prisma/src/adapters/prisma-transaction.repository.ts#L43)

Remove a transaction if it belongs to the provided user.

#### Parameters

##### id

[`TransactionId`](../../domain/type-aliases/TransactionId.md)

##### userId

[`UserId`](../../domain/type-aliases/UserId.md)

#### Returns

`ResultAsync`\<`void`, `Error`\>

#### Implementation of

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md).[`delete`](../../domain/interfaces/TransactionRepository.md#delete)

***

### findById()

> **findById**(`id`): `ResultAsync`\<`null` \| [`Transaction`](../../domain/type-aliases/Transaction.md), `Error`\>

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:69](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/prisma/src/adapters/prisma-transaction.repository.ts#L69)

Lookup a transaction by its identifier.

#### Parameters

##### id

[`TransactionId`](../../domain/type-aliases/TransactionId.md)

#### Returns

`ResultAsync`\<`null` \| [`Transaction`](../../domain/type-aliases/Transaction.md), `Error`\>

#### Implementation of

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md).[`findById`](../../domain/interfaces/TransactionRepository.md#findbyid)

***

### findByUserId()

> **findByUserId**(`userId`): `ResultAsync`\<[`Transaction`](../../domain/type-aliases/Transaction.md)[], `Error`\>

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:83](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/prisma/src/adapters/prisma-transaction.repository.ts#L83)

List all transactions associated with a user.

#### Parameters

##### userId

[`UserId`](../../domain/type-aliases/UserId.md)

#### Returns

`ResultAsync`\<[`Transaction`](../../domain/type-aliases/Transaction.md)[], `Error`\>

#### Implementation of

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md).[`findByUserId`](../../domain/interfaces/TransactionRepository.md#findbyuserid)

***

### update()

> **update**(`tx`): `ResultAsync`\<`void`, `Error`\>

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:97](https://github.com/o3osatoshi/experiment/blob/6cdc4d4fc6fecaa10978fba483375a4d01659beb/packages/prisma/src/adapters/prisma-transaction.repository.ts#L97)

Apply updates to an existing transaction.

#### Parameters

##### tx

[`Transaction`](../../domain/type-aliases/Transaction.md)

#### Returns

`ResultAsync`\<`void`, `Error`\>

#### Implementation of

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md).[`update`](../../domain/interfaces/TransactionRepository.md#update)
