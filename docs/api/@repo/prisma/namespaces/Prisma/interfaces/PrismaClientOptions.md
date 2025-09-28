[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / PrismaClientOptions

# Interface: PrismaClientOptions

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:1108

## Properties

### adapter?

> `optional` **adapter**: `null` \| `SqlDriverAdapterFactory`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:1159

Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`

***

### datasources?

> `optional` **datasources**: [`Datasources`](../type-aliases/Datasources.md)

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:1112

Overwrites the datasource url from your schema.prisma file

***

### datasourceUrl?

> `optional` **datasourceUrl**: `string`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:1116

Overwrites the datasource url from your schema.prisma file

***

### errorFormat?

> `optional` **errorFormat**: [`ErrorFormat`](../type-aliases/ErrorFormat.md)

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:1120

#### Default

```ts
"colorless"
```

***

### log?

> `optional` **log**: ([`LogLevel`](../type-aliases/LogLevel.md) \| [`LogDefinition`](../type-aliases/LogDefinition.md))[]

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:1145

#### Example

```
// Shorthand for `emit: 'stdout'`
log: ['query', 'info', 'warn', 'error']

// Emit as events only
log: [
  { emit: 'event', level: 'query' },
  { emit: 'event', level: 'info' },
  { emit: 'event', level: 'warn' }
  { emit: 'event', level: 'error' }
]

/ Emit as events and log to stdout
og: [
 { emit: 'stdout', level: 'query' },
 { emit: 'stdout', level: 'info' },
 { emit: 'stdout', level: 'warn' }
 { emit: 'stdout', level: 'error' }

```
Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).

***

### omit?

> `optional` **omit**: [`GlobalOmitConfig`](../type-aliases/GlobalOmitConfig.md)

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:1174

Global configuration for omitting model fields by default.

#### Example

```
const prisma = new PrismaClient({
  omit: {
    user: {
      password: true
    }
  }
})
```

***

### transactionOptions?

> `optional` **transactionOptions**: `object`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:1151

The default values for transactionOptions
maxWait ?= 2000
timeout ?= 5000

#### isolationLevel?

> `optional` **isolationLevel**: [`TransactionIsolationLevel`](../type-aliases/TransactionIsolationLevel.md)

#### maxWait?

> `optional` **maxWait**: `number`

#### timeout?

> `optional` **timeout**: `number`
