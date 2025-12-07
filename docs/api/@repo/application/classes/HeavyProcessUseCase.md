[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/application](../README.md) / HeavyProcessUseCase

# Class: HeavyProcessUseCase

Defined in: [packages/application/src/use-cases/toolkit/heavy-process.ts:7](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/application/src/use-cases/toolkit/heavy-process.ts#L7)

## Constructors

### Constructor

> **new HeavyProcessUseCase**(): `HeavyProcessUseCase`

#### Returns

`HeavyProcessUseCase`

## Methods

### execute()

> **execute**(): `ResultAsync`\<\{ `timestamp`: `Date`; \}, `Error`\>

Defined in: [packages/application/src/use-cases/toolkit/heavy-process.ts:17](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/application/src/use-cases/toolkit/heavy-process.ts#L17)

Simulate a heavy synchronous process and return a timestamp-only DTO.

The implementation currently waits for 3 seconds and then resolves with
the current `Date` wrapped in [HeavyProcessResponse](../type-aliases/HeavyProcessResponse.md).

#### Returns

`ResultAsync`\<\{ `timestamp`: `Date`; \}, `Error`\>

ResultAsync wrapping a [HeavyProcessResponse](../type-aliases/HeavyProcessResponse.md) containing the
current timestamp, or an Error if the sleep operation fails.
