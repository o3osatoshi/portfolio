[**Documentation**](../../../../README.md)

***

[Documentation](../../../../README.md) / [@o3osatoshi/ui](../../README.md) / [index.server](../README.md) / cn

# Function: cn()

> **cn**(...`inputs`): `string`

Defined in: [packages/ui/src/lib/utils.ts:16](https://github.com/o3osatoshi/experiment/blob/6295717650ecb2542562c12c20f9540051db6a22/packages/ui/src/lib/utils.ts#L16)

Merge Tailwind CSS class names while de-duplicating conflicting utilities.

Combines `clsx` for conditional class handling with `tailwind-merge` to
ensure later utilities take precedence (e.g. `p-2` overrides `p-4`). This is
the canonical helper exported by the UI package for composing component
classes.

## Parameters

### inputs

...`ClassValue`[]

Class name fragments or conditional tuples accepted by `clsx`.

## Returns

`string`

A single space-delimited class name string safe to pass to React elements.
