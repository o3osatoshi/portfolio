[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionFindFirstArgs

# Type Alias: SessionFindFirstArgs\<ExtArgs\>

> **SessionFindFirstArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:979

Session findFirst

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### cursor?

> `optional` **cursor**: [`SessionWhereUniqueInput`](SessionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:1007

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the position for searching for Sessions.

***

### distinct?

> `optional` **distinct**: [`SessionScalarFieldEnum`](SessionScalarFieldEnum.md) \| [`SessionScalarFieldEnum`](SessionScalarFieldEnum.md)[]

Defined in: packages/prisma/generated/prisma/models/Session.ts:1025

[Distinct Docs](https://www.prisma.io/docs/concepts/components/prisma-client/distinct)

Filter by unique combinations of Sessions.

***

### include?

> `optional` **include**: [`SessionInclude`](SessionInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:991

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`SessionOmit`](SessionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:987

Omit specific fields from the Session

***

### orderBy?

> `optional` **orderBy**: [`SessionOrderByWithRelationInput`](SessionOrderByWithRelationInput.md) \| [`SessionOrderByWithRelationInput`](SessionOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Session.ts:1001

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Sessions to fetch.

***

### select?

> `optional` **select**: [`SessionSelect`](SessionSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:983

Select specific fields to fetch from the Session

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1019

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Sessions.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1013

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Sessions from the position of the cursor.

***

### where?

> `optional` **where**: [`SessionWhereInput`](SessionWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:995

Filter, which Session to fetch.
