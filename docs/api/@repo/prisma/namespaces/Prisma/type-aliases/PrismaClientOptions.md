[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / PrismaClientOptions

# Type Alias: PrismaClientOptions

> **PrismaClientOptions** = \{ `accelerateUrl?`: `never`; `adapter`: `runtime.SqlDriverAdapterFactory`; \} \| \{ `accelerateUrl`: `string`; `adapter?`: `never`; \} & `object`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:1095

## Type Declaration

### comments?

> `optional` **comments**: `runtime.SqlCommenterPlugin`[]

SQL commenter plugins that add metadata to SQL queries as comments.
Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/

#### Example

```
const prisma = new PrismaClient({
  adapter,
  comments: [
    traceContext(),
    queryInsights(),
  ],
})
```

### errorFormat?

> `optional` **errorFormat**: [`ErrorFormat`](ErrorFormat.md)

#### Default

```ts
"colorless"
```

### log?

> `optional` **log**: ([`LogLevel`](LogLevel.md) \| [`LogDefinition`](LogDefinition.md))[]

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
Read more in our [docs](https://pris.ly/d/logging).

### omit?

> `optional` **omit**: [`GlobalOmitConfig`](GlobalOmitConfig.md)

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

### transactionOptions?

> `optional` **transactionOptions**: `object`

The default values for transactionOptions
maxWait ?= 2000
timeout ?= 5000

#### transactionOptions.isolationLevel?

> `optional` **isolationLevel**: [`TransactionIsolationLevel`](TransactionIsolationLevel.md)

#### transactionOptions.maxWait?

> `optional` **maxWait**: `number`

#### transactionOptions.timeout?

> `optional` **timeout**: `number`
