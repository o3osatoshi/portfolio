[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/prisma](../README.md) / PrismaTransactionRepository

# Class: PrismaTransactionRepository

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:20](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/prisma/src/adapters/prisma-transaction.repository.ts#L20)

## Implements

- [`TransactionRepository`](../../domain/interfaces/TransactionRepository.md)

## Constructors

### Constructor

> **new PrismaTransactionRepository**(): `PrismaTransactionRepository`

#### Returns

`PrismaTransactionRepository`

## Methods

### create()

> **create**(`tx`): `ResultAsync`\<[`Transaction`](../../domain/type-aliases/Transaction.md), `Error`\>

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:21](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/prisma/src/adapters/prisma-transaction.repository.ts#L21)

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

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:35](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/prisma/src/adapters/prisma-transaction.repository.ts#L35)

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

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:60](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/prisma/src/adapters/prisma-transaction.repository.ts#L60)

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

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:73](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/prisma/src/adapters/prisma-transaction.repository.ts#L73)

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

Defined in: [packages/prisma/src/adapters/prisma-transaction.repository.ts:86](https://github.com/o3osatoshi/experiment/blob/5bd7d1b2e07e346ab8abb44ddf7730e7fe84cf4f/packages/prisma/src/adapters/prisma-transaction.repository.ts#L86)

#### Parameters

##### tx

[`Transaction`](../../domain/type-aliases/Transaction.md)

#### Returns

`ResultAsync`\<`void`, `Error`\>

#### Implementation of

[`TransactionRepository`](../../domain/interfaces/TransactionRepository.md).[`update`](../../domain/interfaces/TransactionRepository.md#update)
