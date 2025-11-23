[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/interface](../README.md) / buildHandler

# Function: buildHandler()

> **buildHandler**(`deps`): `object`

Defined in: [packages/interface/src/http/node/app.ts:92](https://github.com/o3osatoshi/experiment/blob/d6c8f8f8bbccd739e3017abe2f1d5c3425c068d3/packages/interface/src/http/node/app.ts#L92)

Build Next.js/Vercel-compatible handlers for the Node runtime.

Notes:
- Both `GET` and `POST` are bound to the same underlying Hono app via
  `handle(app)`. Unimplemented methods for a route will return 404.

Usage (Next.js App Router):
```ts
// app/api/[...route]/route.ts
import { createAuthConfig } from "@repo/auth";
import { buildHandler } from "@repo/interface/http/node";
import { createPrismaClient, PrismaTransactionRepository } from "@repo/prisma";
export const runtime = "nodejs";

const prisma = createPrismaClient({ connectionString: process.env.DATABASE_URL! });
const transactionRepo = new PrismaTransactionRepository(prisma);
const authConfig = createAuthConfig({
  providers: { google: { clientId: process.env.AUTH_GOOGLE_ID!, clientSecret: process.env.AUTH_GOOGLE_SECRET! } },
  prismaClient: prisma,
  secret: process.env.AUTH_SECRET!,
});

export const { GET, POST } = buildHandler({ authConfig, transactionRepo });
```

## Parameters

### deps

[`Deps`](../type-aliases/Deps.md)

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
