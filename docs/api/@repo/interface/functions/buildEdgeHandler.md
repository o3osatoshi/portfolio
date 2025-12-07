[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / buildEdgeHandler

# Function: buildEdgeHandler()

> **buildEdgeHandler**(`deps`): `object`

Defined in: [packages/interface/src/http/edge/app.ts:100](https://github.com/o3osatoshi/experiment/blob/adcc987030aec20cfdc84de280ce496a9770d9f1/packages/interface/src/http/edge/app.ts#L100)

Build Next.js/Vercel-compatible handlers for the Edge runtime.

Usage (Next.js App Router):
```ts
// app/edge/[...route]/route.ts
import { createAuthConfig } from "@repo/auth";
import { buildEdgeHandler } from "@repo/interface/http/edge";

export const runtime = "edge";

const authConfig = createAuthConfig({
  providers: { google: { clientId: "...", clientSecret: "..." } },
  secret: "...",
});

export const { GET, POST } = buildEdgeHandler({ authConfig });
```

## Parameters

### deps

[`EdgeDeps`](../type-aliases/EdgeDeps.md)

## Returns

`object`

### GET()

> **GET**: (`req`) => `Response` \| `Promise`\<`Response`\>

#### Parameters

##### req

`Request`

#### Returns

`Response` \| `Promise`\<`Response`\>

### POST()

> **POST**: (`req`) => `Response` \| `Promise`\<`Response`\>

#### Parameters

##### req

`Request`

#### Returns

`Response` \| `Promise`\<`Response`\>
