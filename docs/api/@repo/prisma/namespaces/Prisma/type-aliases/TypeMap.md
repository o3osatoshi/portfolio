[**Documentation**](../../../../../README.md)

***

[Documentation](../../../../../README.md) / [@repo/prisma](../../../README.md) / [Prisma](../README.md) / TypeMap

# Type Alias: TypeMap\<ExtArgs, GlobalOmitOptions\>

> **TypeMap**\<`ExtArgs`, `GlobalOmitOptions`\> = `object` & `object`

Defined in: packages/prisma/generated/prisma/internal/prismaNamespace.ts:403

## Type Declaration

### globalOmitOptions

> **globalOmitOptions**: `object`

#### globalOmitOptions.omit

> **omit**: `GlobalOmitOptions`

### meta

> **meta**: `object`

#### meta.modelProps

> **modelProps**: `"transaction"` \| `"user"` \| `"account"` \| `"session"` \| `"verificationToken"` \| `"authenticator"`

#### meta.txIsolationLevel

> **txIsolationLevel**: [`TransactionIsolationLevel`](TransactionIsolationLevel.md)

### model

> **model**: `object`

#### model.Account

> **Account**: `object`

#### model.Account.fields

> **fields**: [`AccountFieldRefs`](../interfaces/AccountFieldRefs.md)

#### model.Account.operations

> **operations**: `object`

#### model.Account.operations.aggregate

> **aggregate**: `object`

#### model.Account.operations.aggregate.args

> **args**: [`AccountAggregateArgs`](AccountAggregateArgs.md)\<`ExtArgs`\>

#### model.Account.operations.aggregate.result

> **result**: `runtime.Types.Utils.Optional`\<[`AggregateAccount`](AggregateAccount.md)\>

#### model.Account.operations.count

> **count**: `object`

#### model.Account.operations.count.args

> **args**: [`AccountCountArgs`](AccountCountArgs.md)\<`ExtArgs`\>

#### model.Account.operations.count.result

> **result**: `runtime.Types.Utils.Optional`\<[`AccountCountAggregateOutputType`](AccountCountAggregateOutputType.md)\> \| `number`

#### model.Account.operations.create

> **create**: `object`

#### model.Account.operations.create.args

> **args**: [`AccountCreateArgs`](AccountCreateArgs.md)\<`ExtArgs`\>

#### model.Account.operations.create.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AccountPayload`]($AccountPayload.md)\>

#### model.Account.operations.createMany

> **createMany**: `object`

#### model.Account.operations.createMany.args

> **args**: [`AccountCreateManyArgs`](AccountCreateManyArgs.md)\<`ExtArgs`\>

#### model.Account.operations.createMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Account.operations.createManyAndReturn

> **createManyAndReturn**: `object`

#### model.Account.operations.createManyAndReturn.args

> **args**: [`AccountCreateManyAndReturnArgs`](AccountCreateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.Account.operations.createManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AccountPayload`]($AccountPayload.md)\>[]

#### model.Account.operations.delete

> **delete**: `object`

#### model.Account.operations.delete.args

> **args**: [`AccountDeleteArgs`](AccountDeleteArgs.md)\<`ExtArgs`\>

#### model.Account.operations.delete.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AccountPayload`]($AccountPayload.md)\>

#### model.Account.operations.deleteMany

> **deleteMany**: `object`

#### model.Account.operations.deleteMany.args

> **args**: [`AccountDeleteManyArgs`](AccountDeleteManyArgs.md)\<`ExtArgs`\>

#### model.Account.operations.deleteMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Account.operations.findFirst

> **findFirst**: `object`

#### model.Account.operations.findFirst.args

> **args**: [`AccountFindFirstArgs`](AccountFindFirstArgs.md)\<`ExtArgs`\>

#### model.Account.operations.findFirst.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AccountPayload`]($AccountPayload.md)\> \| `null`

#### model.Account.operations.findFirstOrThrow

> **findFirstOrThrow**: `object`

#### model.Account.operations.findFirstOrThrow.args

> **args**: [`AccountFindFirstOrThrowArgs`](AccountFindFirstOrThrowArgs.md)\<`ExtArgs`\>

#### model.Account.operations.findFirstOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AccountPayload`]($AccountPayload.md)\>

#### model.Account.operations.findMany

> **findMany**: `object`

#### model.Account.operations.findMany.args

> **args**: [`AccountFindManyArgs`](AccountFindManyArgs.md)\<`ExtArgs`\>

#### model.Account.operations.findMany.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AccountPayload`]($AccountPayload.md)\>[]

#### model.Account.operations.findUnique

> **findUnique**: `object`

#### model.Account.operations.findUnique.args

> **args**: [`AccountFindUniqueArgs`](AccountFindUniqueArgs.md)\<`ExtArgs`\>

#### model.Account.operations.findUnique.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AccountPayload`]($AccountPayload.md)\> \| `null`

#### model.Account.operations.findUniqueOrThrow

> **findUniqueOrThrow**: `object`

#### model.Account.operations.findUniqueOrThrow.args

> **args**: [`AccountFindUniqueOrThrowArgs`](AccountFindUniqueOrThrowArgs.md)\<`ExtArgs`\>

#### model.Account.operations.findUniqueOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AccountPayload`]($AccountPayload.md)\>

#### model.Account.operations.groupBy

> **groupBy**: `object`

#### model.Account.operations.groupBy.args

> **args**: [`AccountGroupByArgs`](AccountGroupByArgs.md)\<`ExtArgs`\>

#### model.Account.operations.groupBy.result

> **result**: `runtime.Types.Utils.Optional`\<[`AccountGroupByOutputType`](AccountGroupByOutputType.md)\>[]

#### model.Account.operations.update

> **update**: `object`

#### model.Account.operations.update.args

> **args**: [`AccountUpdateArgs`](AccountUpdateArgs.md)\<`ExtArgs`\>

#### model.Account.operations.update.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AccountPayload`]($AccountPayload.md)\>

#### model.Account.operations.updateMany

> **updateMany**: `object`

#### model.Account.operations.updateMany.args

> **args**: [`AccountUpdateManyArgs`](AccountUpdateManyArgs.md)\<`ExtArgs`\>

#### model.Account.operations.updateMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Account.operations.updateManyAndReturn

> **updateManyAndReturn**: `object`

#### model.Account.operations.updateManyAndReturn.args

> **args**: [`AccountUpdateManyAndReturnArgs`](AccountUpdateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.Account.operations.updateManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AccountPayload`]($AccountPayload.md)\>[]

#### model.Account.operations.upsert

> **upsert**: `object`

#### model.Account.operations.upsert.args

> **args**: [`AccountUpsertArgs`](AccountUpsertArgs.md)\<`ExtArgs`\>

#### model.Account.operations.upsert.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AccountPayload`]($AccountPayload.md)\>

#### model.Account.payload

> **payload**: [`$AccountPayload`]($AccountPayload.md)\<`ExtArgs`\>

#### model.Authenticator

> **Authenticator**: `object`

#### model.Authenticator.fields

> **fields**: [`AuthenticatorFieldRefs`](../interfaces/AuthenticatorFieldRefs.md)

#### model.Authenticator.operations

> **operations**: `object`

#### model.Authenticator.operations.aggregate

> **aggregate**: `object`

#### model.Authenticator.operations.aggregate.args

> **args**: [`AuthenticatorAggregateArgs`](AuthenticatorAggregateArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.aggregate.result

> **result**: `runtime.Types.Utils.Optional`\<[`AggregateAuthenticator`](AggregateAuthenticator.md)\>

#### model.Authenticator.operations.count

> **count**: `object`

#### model.Authenticator.operations.count.args

> **args**: [`AuthenticatorCountArgs`](AuthenticatorCountArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.count.result

> **result**: `runtime.Types.Utils.Optional`\<[`AuthenticatorCountAggregateOutputType`](AuthenticatorCountAggregateOutputType.md)\> \| `number`

#### model.Authenticator.operations.create

> **create**: `object`

#### model.Authenticator.operations.create.args

> **args**: [`AuthenticatorCreateArgs`](AuthenticatorCreateArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.create.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AuthenticatorPayload`]($AuthenticatorPayload.md)\>

#### model.Authenticator.operations.createMany

> **createMany**: `object`

#### model.Authenticator.operations.createMany.args

> **args**: [`AuthenticatorCreateManyArgs`](AuthenticatorCreateManyArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.createMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Authenticator.operations.createManyAndReturn

> **createManyAndReturn**: `object`

#### model.Authenticator.operations.createManyAndReturn.args

> **args**: [`AuthenticatorCreateManyAndReturnArgs`](AuthenticatorCreateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.createManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AuthenticatorPayload`]($AuthenticatorPayload.md)\>[]

#### model.Authenticator.operations.delete

> **delete**: `object`

#### model.Authenticator.operations.delete.args

> **args**: [`AuthenticatorDeleteArgs`](AuthenticatorDeleteArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.delete.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AuthenticatorPayload`]($AuthenticatorPayload.md)\>

#### model.Authenticator.operations.deleteMany

> **deleteMany**: `object`

#### model.Authenticator.operations.deleteMany.args

> **args**: [`AuthenticatorDeleteManyArgs`](AuthenticatorDeleteManyArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.deleteMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Authenticator.operations.findFirst

> **findFirst**: `object`

#### model.Authenticator.operations.findFirst.args

> **args**: [`AuthenticatorFindFirstArgs`](AuthenticatorFindFirstArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.findFirst.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AuthenticatorPayload`]($AuthenticatorPayload.md)\> \| `null`

#### model.Authenticator.operations.findFirstOrThrow

> **findFirstOrThrow**: `object`

#### model.Authenticator.operations.findFirstOrThrow.args

> **args**: [`AuthenticatorFindFirstOrThrowArgs`](AuthenticatorFindFirstOrThrowArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.findFirstOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AuthenticatorPayload`]($AuthenticatorPayload.md)\>

#### model.Authenticator.operations.findMany

> **findMany**: `object`

#### model.Authenticator.operations.findMany.args

> **args**: [`AuthenticatorFindManyArgs`](AuthenticatorFindManyArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.findMany.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AuthenticatorPayload`]($AuthenticatorPayload.md)\>[]

#### model.Authenticator.operations.findUnique

> **findUnique**: `object`

#### model.Authenticator.operations.findUnique.args

> **args**: [`AuthenticatorFindUniqueArgs`](AuthenticatorFindUniqueArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.findUnique.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AuthenticatorPayload`]($AuthenticatorPayload.md)\> \| `null`

#### model.Authenticator.operations.findUniqueOrThrow

> **findUniqueOrThrow**: `object`

#### model.Authenticator.operations.findUniqueOrThrow.args

> **args**: [`AuthenticatorFindUniqueOrThrowArgs`](AuthenticatorFindUniqueOrThrowArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.findUniqueOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AuthenticatorPayload`]($AuthenticatorPayload.md)\>

#### model.Authenticator.operations.groupBy

> **groupBy**: `object`

#### model.Authenticator.operations.groupBy.args

> **args**: [`AuthenticatorGroupByArgs`](AuthenticatorGroupByArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.groupBy.result

> **result**: `runtime.Types.Utils.Optional`\<[`AuthenticatorGroupByOutputType`](AuthenticatorGroupByOutputType.md)\>[]

#### model.Authenticator.operations.update

> **update**: `object`

#### model.Authenticator.operations.update.args

> **args**: [`AuthenticatorUpdateArgs`](AuthenticatorUpdateArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.update.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AuthenticatorPayload`]($AuthenticatorPayload.md)\>

#### model.Authenticator.operations.updateMany

> **updateMany**: `object`

#### model.Authenticator.operations.updateMany.args

> **args**: [`AuthenticatorUpdateManyArgs`](AuthenticatorUpdateManyArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.updateMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Authenticator.operations.updateManyAndReturn

> **updateManyAndReturn**: `object`

#### model.Authenticator.operations.updateManyAndReturn.args

> **args**: [`AuthenticatorUpdateManyAndReturnArgs`](AuthenticatorUpdateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.updateManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AuthenticatorPayload`]($AuthenticatorPayload.md)\>[]

#### model.Authenticator.operations.upsert

> **upsert**: `object`

#### model.Authenticator.operations.upsert.args

> **args**: [`AuthenticatorUpsertArgs`](AuthenticatorUpsertArgs.md)\<`ExtArgs`\>

#### model.Authenticator.operations.upsert.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$AuthenticatorPayload`]($AuthenticatorPayload.md)\>

#### model.Authenticator.payload

> **payload**: [`$AuthenticatorPayload`]($AuthenticatorPayload.md)\<`ExtArgs`\>

#### model.Session

> **Session**: `object`

#### model.Session.fields

> **fields**: [`SessionFieldRefs`](../interfaces/SessionFieldRefs.md)

#### model.Session.operations

> **operations**: `object`

#### model.Session.operations.aggregate

> **aggregate**: `object`

#### model.Session.operations.aggregate.args

> **args**: [`SessionAggregateArgs`](SessionAggregateArgs.md)\<`ExtArgs`\>

#### model.Session.operations.aggregate.result

> **result**: `runtime.Types.Utils.Optional`\<[`AggregateSession`](AggregateSession.md)\>

#### model.Session.operations.count

> **count**: `object`

#### model.Session.operations.count.args

> **args**: [`SessionCountArgs`](SessionCountArgs.md)\<`ExtArgs`\>

#### model.Session.operations.count.result

> **result**: `runtime.Types.Utils.Optional`\<[`SessionCountAggregateOutputType`](SessionCountAggregateOutputType.md)\> \| `number`

#### model.Session.operations.create

> **create**: `object`

#### model.Session.operations.create.args

> **args**: [`SessionCreateArgs`](SessionCreateArgs.md)\<`ExtArgs`\>

#### model.Session.operations.create.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$SessionPayload`]($SessionPayload.md)\>

#### model.Session.operations.createMany

> **createMany**: `object`

#### model.Session.operations.createMany.args

> **args**: [`SessionCreateManyArgs`](SessionCreateManyArgs.md)\<`ExtArgs`\>

#### model.Session.operations.createMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Session.operations.createManyAndReturn

> **createManyAndReturn**: `object`

#### model.Session.operations.createManyAndReturn.args

> **args**: [`SessionCreateManyAndReturnArgs`](SessionCreateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.Session.operations.createManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$SessionPayload`]($SessionPayload.md)\>[]

#### model.Session.operations.delete

> **delete**: `object`

#### model.Session.operations.delete.args

> **args**: [`SessionDeleteArgs`](SessionDeleteArgs.md)\<`ExtArgs`\>

#### model.Session.operations.delete.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$SessionPayload`]($SessionPayload.md)\>

#### model.Session.operations.deleteMany

> **deleteMany**: `object`

#### model.Session.operations.deleteMany.args

> **args**: [`SessionDeleteManyArgs`](SessionDeleteManyArgs.md)\<`ExtArgs`\>

#### model.Session.operations.deleteMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Session.operations.findFirst

> **findFirst**: `object`

#### model.Session.operations.findFirst.args

> **args**: [`SessionFindFirstArgs`](SessionFindFirstArgs.md)\<`ExtArgs`\>

#### model.Session.operations.findFirst.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$SessionPayload`]($SessionPayload.md)\> \| `null`

#### model.Session.operations.findFirstOrThrow

> **findFirstOrThrow**: `object`

#### model.Session.operations.findFirstOrThrow.args

> **args**: [`SessionFindFirstOrThrowArgs`](SessionFindFirstOrThrowArgs.md)\<`ExtArgs`\>

#### model.Session.operations.findFirstOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$SessionPayload`]($SessionPayload.md)\>

#### model.Session.operations.findMany

> **findMany**: `object`

#### model.Session.operations.findMany.args

> **args**: [`SessionFindManyArgs`](SessionFindManyArgs.md)\<`ExtArgs`\>

#### model.Session.operations.findMany.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$SessionPayload`]($SessionPayload.md)\>[]

#### model.Session.operations.findUnique

> **findUnique**: `object`

#### model.Session.operations.findUnique.args

> **args**: [`SessionFindUniqueArgs`](SessionFindUniqueArgs.md)\<`ExtArgs`\>

#### model.Session.operations.findUnique.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$SessionPayload`]($SessionPayload.md)\> \| `null`

#### model.Session.operations.findUniqueOrThrow

> **findUniqueOrThrow**: `object`

#### model.Session.operations.findUniqueOrThrow.args

> **args**: [`SessionFindUniqueOrThrowArgs`](SessionFindUniqueOrThrowArgs.md)\<`ExtArgs`\>

#### model.Session.operations.findUniqueOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$SessionPayload`]($SessionPayload.md)\>

#### model.Session.operations.groupBy

> **groupBy**: `object`

#### model.Session.operations.groupBy.args

> **args**: [`SessionGroupByArgs`](SessionGroupByArgs.md)\<`ExtArgs`\>

#### model.Session.operations.groupBy.result

> **result**: `runtime.Types.Utils.Optional`\<[`SessionGroupByOutputType`](SessionGroupByOutputType.md)\>[]

#### model.Session.operations.update

> **update**: `object`

#### model.Session.operations.update.args

> **args**: [`SessionUpdateArgs`](SessionUpdateArgs.md)\<`ExtArgs`\>

#### model.Session.operations.update.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$SessionPayload`]($SessionPayload.md)\>

#### model.Session.operations.updateMany

> **updateMany**: `object`

#### model.Session.operations.updateMany.args

> **args**: [`SessionUpdateManyArgs`](SessionUpdateManyArgs.md)\<`ExtArgs`\>

#### model.Session.operations.updateMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Session.operations.updateManyAndReturn

> **updateManyAndReturn**: `object`

#### model.Session.operations.updateManyAndReturn.args

> **args**: [`SessionUpdateManyAndReturnArgs`](SessionUpdateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.Session.operations.updateManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$SessionPayload`]($SessionPayload.md)\>[]

#### model.Session.operations.upsert

> **upsert**: `object`

#### model.Session.operations.upsert.args

> **args**: [`SessionUpsertArgs`](SessionUpsertArgs.md)\<`ExtArgs`\>

#### model.Session.operations.upsert.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$SessionPayload`]($SessionPayload.md)\>

#### model.Session.payload

> **payload**: [`$SessionPayload`]($SessionPayload.md)\<`ExtArgs`\>

#### model.Transaction

> **Transaction**: `object`

#### model.Transaction.fields

> **fields**: [`TransactionFieldRefs`](../interfaces/TransactionFieldRefs.md)

#### model.Transaction.operations

> **operations**: `object`

#### model.Transaction.operations.aggregate

> **aggregate**: `object`

#### model.Transaction.operations.aggregate.args

> **args**: [`TransactionAggregateArgs`](TransactionAggregateArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.aggregate.result

> **result**: `runtime.Types.Utils.Optional`\<[`AggregateTransaction`](AggregateTransaction.md)\>

#### model.Transaction.operations.count

> **count**: `object`

#### model.Transaction.operations.count.args

> **args**: [`TransactionCountArgs`](TransactionCountArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.count.result

> **result**: `runtime.Types.Utils.Optional`\<[`TransactionCountAggregateOutputType`](TransactionCountAggregateOutputType.md)\> \| `number`

#### model.Transaction.operations.create

> **create**: `object`

#### model.Transaction.operations.create.args

> **args**: [`TransactionCreateArgs`](TransactionCreateArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.create.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$TransactionPayload`]($TransactionPayload.md)\>

#### model.Transaction.operations.createMany

> **createMany**: `object`

#### model.Transaction.operations.createMany.args

> **args**: [`TransactionCreateManyArgs`](TransactionCreateManyArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.createMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Transaction.operations.createManyAndReturn

> **createManyAndReturn**: `object`

#### model.Transaction.operations.createManyAndReturn.args

> **args**: [`TransactionCreateManyAndReturnArgs`](TransactionCreateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.createManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$TransactionPayload`]($TransactionPayload.md)\>[]

#### model.Transaction.operations.delete

> **delete**: `object`

#### model.Transaction.operations.delete.args

> **args**: [`TransactionDeleteArgs`](TransactionDeleteArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.delete.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$TransactionPayload`]($TransactionPayload.md)\>

#### model.Transaction.operations.deleteMany

> **deleteMany**: `object`

#### model.Transaction.operations.deleteMany.args

> **args**: [`TransactionDeleteManyArgs`](TransactionDeleteManyArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.deleteMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Transaction.operations.findFirst

> **findFirst**: `object`

#### model.Transaction.operations.findFirst.args

> **args**: [`TransactionFindFirstArgs`](TransactionFindFirstArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.findFirst.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$TransactionPayload`]($TransactionPayload.md)\> \| `null`

#### model.Transaction.operations.findFirstOrThrow

> **findFirstOrThrow**: `object`

#### model.Transaction.operations.findFirstOrThrow.args

> **args**: [`TransactionFindFirstOrThrowArgs`](TransactionFindFirstOrThrowArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.findFirstOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$TransactionPayload`]($TransactionPayload.md)\>

#### model.Transaction.operations.findMany

> **findMany**: `object`

#### model.Transaction.operations.findMany.args

> **args**: [`TransactionFindManyArgs`](TransactionFindManyArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.findMany.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$TransactionPayload`]($TransactionPayload.md)\>[]

#### model.Transaction.operations.findUnique

> **findUnique**: `object`

#### model.Transaction.operations.findUnique.args

> **args**: [`TransactionFindUniqueArgs`](TransactionFindUniqueArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.findUnique.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$TransactionPayload`]($TransactionPayload.md)\> \| `null`

#### model.Transaction.operations.findUniqueOrThrow

> **findUniqueOrThrow**: `object`

#### model.Transaction.operations.findUniqueOrThrow.args

> **args**: [`TransactionFindUniqueOrThrowArgs`](TransactionFindUniqueOrThrowArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.findUniqueOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$TransactionPayload`]($TransactionPayload.md)\>

#### model.Transaction.operations.groupBy

> **groupBy**: `object`

#### model.Transaction.operations.groupBy.args

> **args**: [`TransactionGroupByArgs`](TransactionGroupByArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.groupBy.result

> **result**: `runtime.Types.Utils.Optional`\<[`TransactionGroupByOutputType`](TransactionGroupByOutputType.md)\>[]

#### model.Transaction.operations.update

> **update**: `object`

#### model.Transaction.operations.update.args

> **args**: [`TransactionUpdateArgs`](TransactionUpdateArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.update.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$TransactionPayload`]($TransactionPayload.md)\>

#### model.Transaction.operations.updateMany

> **updateMany**: `object`

#### model.Transaction.operations.updateMany.args

> **args**: [`TransactionUpdateManyArgs`](TransactionUpdateManyArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.updateMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.Transaction.operations.updateManyAndReturn

> **updateManyAndReturn**: `object`

#### model.Transaction.operations.updateManyAndReturn.args

> **args**: [`TransactionUpdateManyAndReturnArgs`](TransactionUpdateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.updateManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$TransactionPayload`]($TransactionPayload.md)\>[]

#### model.Transaction.operations.upsert

> **upsert**: `object`

#### model.Transaction.operations.upsert.args

> **args**: [`TransactionUpsertArgs`](TransactionUpsertArgs.md)\<`ExtArgs`\>

#### model.Transaction.operations.upsert.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$TransactionPayload`]($TransactionPayload.md)\>

#### model.Transaction.payload

> **payload**: [`$TransactionPayload`]($TransactionPayload.md)\<`ExtArgs`\>

#### model.User

> **User**: `object`

#### model.User.fields

> **fields**: [`UserFieldRefs`](../interfaces/UserFieldRefs.md)

#### model.User.operations

> **operations**: `object`

#### model.User.operations.aggregate

> **aggregate**: `object`

#### model.User.operations.aggregate.args

> **args**: [`UserAggregateArgs`](UserAggregateArgs.md)\<`ExtArgs`\>

#### model.User.operations.aggregate.result

> **result**: `runtime.Types.Utils.Optional`\<[`AggregateUser`](AggregateUser.md)\>

#### model.User.operations.count

> **count**: `object`

#### model.User.operations.count.args

> **args**: [`UserCountArgs`](UserCountArgs.md)\<`ExtArgs`\>

#### model.User.operations.count.result

> **result**: `runtime.Types.Utils.Optional`\<[`UserCountAggregateOutputType`](UserCountAggregateOutputType.md)\> \| `number`

#### model.User.operations.create

> **create**: `object`

#### model.User.operations.create.args

> **args**: [`UserCreateArgs`](UserCreateArgs.md)\<`ExtArgs`\>

#### model.User.operations.create.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$UserPayload`]($UserPayload.md)\>

#### model.User.operations.createMany

> **createMany**: `object`

#### model.User.operations.createMany.args

> **args**: [`UserCreateManyArgs`](UserCreateManyArgs.md)\<`ExtArgs`\>

#### model.User.operations.createMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.User.operations.createManyAndReturn

> **createManyAndReturn**: `object`

#### model.User.operations.createManyAndReturn.args

> **args**: [`UserCreateManyAndReturnArgs`](UserCreateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.User.operations.createManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$UserPayload`]($UserPayload.md)\>[]

#### model.User.operations.delete

> **delete**: `object`

#### model.User.operations.delete.args

> **args**: [`UserDeleteArgs`](UserDeleteArgs.md)\<`ExtArgs`\>

#### model.User.operations.delete.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$UserPayload`]($UserPayload.md)\>

#### model.User.operations.deleteMany

> **deleteMany**: `object`

#### model.User.operations.deleteMany.args

> **args**: [`UserDeleteManyArgs`](UserDeleteManyArgs.md)\<`ExtArgs`\>

#### model.User.operations.deleteMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.User.operations.findFirst

> **findFirst**: `object`

#### model.User.operations.findFirst.args

> **args**: [`UserFindFirstArgs`](UserFindFirstArgs.md)\<`ExtArgs`\>

#### model.User.operations.findFirst.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$UserPayload`]($UserPayload.md)\> \| `null`

#### model.User.operations.findFirstOrThrow

> **findFirstOrThrow**: `object`

#### model.User.operations.findFirstOrThrow.args

> **args**: [`UserFindFirstOrThrowArgs`](UserFindFirstOrThrowArgs.md)\<`ExtArgs`\>

#### model.User.operations.findFirstOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$UserPayload`]($UserPayload.md)\>

#### model.User.operations.findMany

> **findMany**: `object`

#### model.User.operations.findMany.args

> **args**: [`UserFindManyArgs`](UserFindManyArgs.md)\<`ExtArgs`\>

#### model.User.operations.findMany.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$UserPayload`]($UserPayload.md)\>[]

#### model.User.operations.findUnique

> **findUnique**: `object`

#### model.User.operations.findUnique.args

> **args**: [`UserFindUniqueArgs`](UserFindUniqueArgs.md)\<`ExtArgs`\>

#### model.User.operations.findUnique.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$UserPayload`]($UserPayload.md)\> \| `null`

#### model.User.operations.findUniqueOrThrow

> **findUniqueOrThrow**: `object`

#### model.User.operations.findUniqueOrThrow.args

> **args**: [`UserFindUniqueOrThrowArgs`](UserFindUniqueOrThrowArgs.md)\<`ExtArgs`\>

#### model.User.operations.findUniqueOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$UserPayload`]($UserPayload.md)\>

#### model.User.operations.groupBy

> **groupBy**: `object`

#### model.User.operations.groupBy.args

> **args**: [`UserGroupByArgs`](UserGroupByArgs.md)\<`ExtArgs`\>

#### model.User.operations.groupBy.result

> **result**: `runtime.Types.Utils.Optional`\<[`UserGroupByOutputType`](UserGroupByOutputType.md)\>[]

#### model.User.operations.update

> **update**: `object`

#### model.User.operations.update.args

> **args**: [`UserUpdateArgs`](UserUpdateArgs.md)\<`ExtArgs`\>

#### model.User.operations.update.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$UserPayload`]($UserPayload.md)\>

#### model.User.operations.updateMany

> **updateMany**: `object`

#### model.User.operations.updateMany.args

> **args**: [`UserUpdateManyArgs`](UserUpdateManyArgs.md)\<`ExtArgs`\>

#### model.User.operations.updateMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.User.operations.updateManyAndReturn

> **updateManyAndReturn**: `object`

#### model.User.operations.updateManyAndReturn.args

> **args**: [`UserUpdateManyAndReturnArgs`](UserUpdateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.User.operations.updateManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$UserPayload`]($UserPayload.md)\>[]

#### model.User.operations.upsert

> **upsert**: `object`

#### model.User.operations.upsert.args

> **args**: [`UserUpsertArgs`](UserUpsertArgs.md)\<`ExtArgs`\>

#### model.User.operations.upsert.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$UserPayload`]($UserPayload.md)\>

#### model.User.payload

> **payload**: [`$UserPayload`]($UserPayload.md)\<`ExtArgs`\>

#### model.VerificationToken

> **VerificationToken**: `object`

#### model.VerificationToken.fields

> **fields**: [`VerificationTokenFieldRefs`](../interfaces/VerificationTokenFieldRefs.md)

#### model.VerificationToken.operations

> **operations**: `object`

#### model.VerificationToken.operations.aggregate

> **aggregate**: `object`

#### model.VerificationToken.operations.aggregate.args

> **args**: [`VerificationTokenAggregateArgs`](VerificationTokenAggregateArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.aggregate.result

> **result**: `runtime.Types.Utils.Optional`\<[`AggregateVerificationToken`](AggregateVerificationToken.md)\>

#### model.VerificationToken.operations.count

> **count**: `object`

#### model.VerificationToken.operations.count.args

> **args**: [`VerificationTokenCountArgs`](VerificationTokenCountArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.count.result

> **result**: `runtime.Types.Utils.Optional`\<[`VerificationTokenCountAggregateOutputType`](VerificationTokenCountAggregateOutputType.md)\> \| `number`

#### model.VerificationToken.operations.create

> **create**: `object`

#### model.VerificationToken.operations.create.args

> **args**: [`VerificationTokenCreateArgs`](VerificationTokenCreateArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.create.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$VerificationTokenPayload`]($VerificationTokenPayload.md)\>

#### model.VerificationToken.operations.createMany

> **createMany**: `object`

#### model.VerificationToken.operations.createMany.args

> **args**: [`VerificationTokenCreateManyArgs`](VerificationTokenCreateManyArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.createMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.VerificationToken.operations.createManyAndReturn

> **createManyAndReturn**: `object`

#### model.VerificationToken.operations.createManyAndReturn.args

> **args**: [`VerificationTokenCreateManyAndReturnArgs`](VerificationTokenCreateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.createManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$VerificationTokenPayload`]($VerificationTokenPayload.md)\>[]

#### model.VerificationToken.operations.delete

> **delete**: `object`

#### model.VerificationToken.operations.delete.args

> **args**: [`VerificationTokenDeleteArgs`](VerificationTokenDeleteArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.delete.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$VerificationTokenPayload`]($VerificationTokenPayload.md)\>

#### model.VerificationToken.operations.deleteMany

> **deleteMany**: `object`

#### model.VerificationToken.operations.deleteMany.args

> **args**: [`VerificationTokenDeleteManyArgs`](VerificationTokenDeleteManyArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.deleteMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.VerificationToken.operations.findFirst

> **findFirst**: `object`

#### model.VerificationToken.operations.findFirst.args

> **args**: [`VerificationTokenFindFirstArgs`](VerificationTokenFindFirstArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.findFirst.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$VerificationTokenPayload`]($VerificationTokenPayload.md)\> \| `null`

#### model.VerificationToken.operations.findFirstOrThrow

> **findFirstOrThrow**: `object`

#### model.VerificationToken.operations.findFirstOrThrow.args

> **args**: [`VerificationTokenFindFirstOrThrowArgs`](VerificationTokenFindFirstOrThrowArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.findFirstOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$VerificationTokenPayload`]($VerificationTokenPayload.md)\>

#### model.VerificationToken.operations.findMany

> **findMany**: `object`

#### model.VerificationToken.operations.findMany.args

> **args**: [`VerificationTokenFindManyArgs`](VerificationTokenFindManyArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.findMany.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$VerificationTokenPayload`]($VerificationTokenPayload.md)\>[]

#### model.VerificationToken.operations.findUnique

> **findUnique**: `object`

#### model.VerificationToken.operations.findUnique.args

> **args**: [`VerificationTokenFindUniqueArgs`](VerificationTokenFindUniqueArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.findUnique.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$VerificationTokenPayload`]($VerificationTokenPayload.md)\> \| `null`

#### model.VerificationToken.operations.findUniqueOrThrow

> **findUniqueOrThrow**: `object`

#### model.VerificationToken.operations.findUniqueOrThrow.args

> **args**: [`VerificationTokenFindUniqueOrThrowArgs`](VerificationTokenFindUniqueOrThrowArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.findUniqueOrThrow.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$VerificationTokenPayload`]($VerificationTokenPayload.md)\>

#### model.VerificationToken.operations.groupBy

> **groupBy**: `object`

#### model.VerificationToken.operations.groupBy.args

> **args**: [`VerificationTokenGroupByArgs`](VerificationTokenGroupByArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.groupBy.result

> **result**: `runtime.Types.Utils.Optional`\<[`VerificationTokenGroupByOutputType`](VerificationTokenGroupByOutputType.md)\>[]

#### model.VerificationToken.operations.update

> **update**: `object`

#### model.VerificationToken.operations.update.args

> **args**: [`VerificationTokenUpdateArgs`](VerificationTokenUpdateArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.update.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$VerificationTokenPayload`]($VerificationTokenPayload.md)\>

#### model.VerificationToken.operations.updateMany

> **updateMany**: `object`

#### model.VerificationToken.operations.updateMany.args

> **args**: [`VerificationTokenUpdateManyArgs`](VerificationTokenUpdateManyArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.updateMany.result

> **result**: [`BatchPayload`](BatchPayload.md)

#### model.VerificationToken.operations.updateManyAndReturn

> **updateManyAndReturn**: `object`

#### model.VerificationToken.operations.updateManyAndReturn.args

> **args**: [`VerificationTokenUpdateManyAndReturnArgs`](VerificationTokenUpdateManyAndReturnArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.updateManyAndReturn.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$VerificationTokenPayload`]($VerificationTokenPayload.md)\>[]

#### model.VerificationToken.operations.upsert

> **upsert**: `object`

#### model.VerificationToken.operations.upsert.args

> **args**: [`VerificationTokenUpsertArgs`](VerificationTokenUpsertArgs.md)\<`ExtArgs`\>

#### model.VerificationToken.operations.upsert.result

> **result**: `runtime.Types.Utils.PayloadToResult`\<[`$VerificationTokenPayload`]($VerificationTokenPayload.md)\>

#### model.VerificationToken.payload

> **payload**: [`$VerificationTokenPayload`]($VerificationTokenPayload.md)\<`ExtArgs`\>

## Type Declaration

### other

> **other**: `object`

#### other.operations

> **operations**: `object`

#### other.operations.$executeRaw

> **$executeRaw**: `object`

#### other.operations.$executeRaw.args

> **args**: \[`TemplateStringsArray` \| [`Sql`](Sql.md), `any`[]\]

#### other.operations.$executeRaw.result

> **result**: `any`

#### other.operations.$executeRawUnsafe

> **$executeRawUnsafe**: `object`

#### other.operations.$executeRawUnsafe.args

> **args**: \[`string`, `any`[]\]

#### other.operations.$executeRawUnsafe.result

> **result**: `any`

#### other.operations.$queryRaw

> **$queryRaw**: `object`

#### other.operations.$queryRaw.args

> **args**: \[`TemplateStringsArray` \| [`Sql`](Sql.md), `any`[]\]

#### other.operations.$queryRaw.result

> **result**: `any`

#### other.operations.$queryRawUnsafe

> **$queryRawUnsafe**: `object`

#### other.operations.$queryRawUnsafe.args

> **args**: \[`string`, `any`[]\]

#### other.operations.$queryRawUnsafe.result

> **result**: `any`

#### other.payload

> **payload**: `any`

## Type Parameters

### ExtArgs

`ExtArgs` *extends* `runtime.Types.Extensions.InternalArgs` = `runtime.Types.Extensions.DefaultArgs`

### GlobalOmitOptions

`GlobalOmitOptions` = \{ \}
