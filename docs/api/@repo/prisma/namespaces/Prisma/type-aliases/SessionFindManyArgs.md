[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / SessionFindManyArgs

# Type Alias: SessionFindManyArgs\<ExtArgs\>

> **SessionFindManyArgs**\<`ExtArgs`\> = `object`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1083

Session findMany

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

## Properties

### cursor?

> `optional` **cursor**: [`SessionWhereUniqueInput`](SessionWhereUniqueInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:1111

[Cursor Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination)

Sets the position for listing Sessions.

***

### distinct?

> `optional` **distinct**: [`SessionScalarFieldEnum`](SessionScalarFieldEnum.md) \| [`SessionScalarFieldEnum`](SessionScalarFieldEnum.md)[]

Defined in: packages/prisma/generated/prisma/models/Session.ts:1124

***

### include?

> `optional` **include**: [`SessionInclude`](SessionInclude.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1095

Choose, which related nodes to fetch as well

***

### omit?

> `optional` **omit**: [`SessionOmit`](SessionOmit.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1091

Omit specific fields from the Session

***

### orderBy?

> `optional` **orderBy**: [`SessionOrderByWithRelationInput`](SessionOrderByWithRelationInput.md) \| [`SessionOrderByWithRelationInput`](SessionOrderByWithRelationInput.md)[]

Defined in: packages/prisma/generated/prisma/models/Session.ts:1105

[Sorting Docs](https://www.prisma.io/docs/concepts/components/prisma-client/sorting)

Determine the order of Sessions to fetch.

***

### select?

> `optional` **select**: [`SessionSelect`](SessionSelect.md)\<`ExtArgs`\> \| `null`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1087

Select specific fields to fetch from the Session

***

### skip?

> `optional` **skip**: `number`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1123

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Skip the first `n` Sessions.

***

### take?

> `optional` **take**: `number`

Defined in: packages/prisma/generated/prisma/models/Session.ts:1117

[Pagination Docs](https://www.prisma.io/docs/concepts/components/prisma-client/pagination)

Take `±n` Sessions from the position of the cursor.

***

### where?

> `optional` **where**: [`SessionWhereInput`](SessionWhereInput.md)

Defined in: packages/prisma/generated/prisma/models/Session.ts:1099

Filter, which Sessions to fetch.
