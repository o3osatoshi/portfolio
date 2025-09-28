[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionFindFirstOrThrowArgs

# Type Alias: SessionFindFirstOrThrowArgs\<ExtArgs\>

> **SessionFindFirstOrThrowArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1031

Session findFirstOrThrow

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### cursor?

> `optional` **cursor**: [`SessionWhereUniqueInput`](SessionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:1059

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the position for searching for Sessions.

***

### distinct?

> `optional` **distinct**: [`SessionScalarFieldEnum`](SessionScalarFieldEnum.md) \| [`SessionScalarFieldEnum`](SessionScalarFieldEnum.md)[]

Defined in: packages/prisma/generated/prisma/models/Session.ts:1077

[Distinct Docs](https://www.prisma.io/docs/concepts/components/prisma-client/distinct)

Filter by unique combinations of Sessions.

***

### include?

> `optional` **include**: [`SessionInclude`](SessionInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1043

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`SessionOmit`](SessionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1039

Omit specific fields from the Session

***

### orderBy?

> `optional` **orderBy**: [`SessionOrderByWithRelationInput`](SessionOrderByWithRelationInput.md) \| [`SessionOrderByWithRelationInput`](SessionOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Session.ts:1053

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Sessions to fetch.

***

### select?

> `optional` **select**: [`SessionSelect`](SessionSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1035

Select specific fields to fetch from the Session

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1071

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Sessions.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1065

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Sessions from the position of the cursor.

***

### where?

> `optional` **where**: [`SessionWhereInput`](SessionWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:1047

Filter, which Session to fetch.
