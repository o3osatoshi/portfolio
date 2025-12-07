[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@repo/auth](../README.md) / AuthConfig

# Interface: AuthConfig

Defined in: node\_modules/.pnpm/@hono+auth-js@1.1.0\_@auth+core@0.34.3\_hono@4.10.7\_react@19.2.1/node\_modules/@hono/auth-js/dist/index.d.ts:24

## Extends

- `Omit`\<`AuthConfig$1`, `"raw"`\>

## Properties

### adapter?

> `optional` **adapter**: `Adapter`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:388

You can use the adapter option to pass in your database adapter.

#### Inherited from

`Omit.adapter`

***

### basePath?

> `optional` **basePath**: `string`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:520

The base path of the Auth.js API endpoints.

#### Default

```ts
"/api/auth" in "next-auth"; "/auth" with all other frameworks
```

#### Inherited from

`Omit.basePath`

***

### callbacks?

> `optional` **callbacks**: `object`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:155

Callbacks are asynchronous functions you can use to control what happens when an action is performed.
Callbacks are *extremely powerful*, especially in scenarios involving JSON Web Tokens
as they **allow you to implement access controls without a database** and to **integrate with external databases or APIs**.

#### jwt()?

> `optional` **jwt**: (`params`) => `Awaitable`\<`JWT` \| `null`\>

This callback is called whenever a JSON Web Token is created (i.e. at sign in)
or updated (i.e whenever a session is accessed in the client). Anything you
return here will be saved in the JWT and forwarded to the session callback.
There you can control what should be returned to the client. Anything else
will be kept from your frontend. The JWT is encrypted by default via your
AUTH_SECRET environment variable.

[`session` callback](https://authjs.dev/reference/core/types#session)

##### Parameters

###### params

###### account

`Account` \| `null`

Contains information about the provider that was used to sign in.
Also includes TokenSet

**Note**

available when `trigger` is `"signIn"` or `"signUp"`

###### isNewUser?

`boolean`

**Deprecated**

use `trigger === "signUp"` instead

###### profile?

`Profile`

The OAuth profile returned from your provider.
(In case of OIDC it will be the decoded ID Token or /userinfo response)

**Note**

available when `trigger` is `"signIn"`.

###### session?

`any`

When using [AuthConfig.session](#session) `strategy: "jwt"`, this is the data
sent from the client via the `useSession().update` method.

⚠ Note, you should validate this data before using it.

###### token

`JWT`

When `trigger` is `"signIn"` or `"signUp"`, it will be a subset of [JWT](../type-aliases/JWT.md),
`name`, `email` and `image` will be included.

Otherwise, it will be the full [JWT](../type-aliases/JWT.md) for subsequent calls.

###### trigger?

`"signIn"` \| `"signUp"` \| `"update"`

Check why was the jwt callback invoked. Possible reasons are:
- user sign-in: First time the callback is invoked, `user`, `profile` and `account` will be present.
- user sign-up: a user is created for the first time in the database (when [AuthConfig.session](#session).strategy is set to `"database"`)
- update event: Triggered by the `useSession().update` method.
In case of the latter, `trigger` will be `undefined`.

###### user

`User` \| `AdapterUser`

Either the result of the OAuthConfig.profile or the CredentialsConfig.authorize callback.

**Note**

available when `trigger` is `"signIn"` or `"signUp"`.

Resources:
- [Credentials Provider](https://authjs.dev/getting-started/authentication/credentials)
- [User database model](https://authjs.dev/guides/creating-a-database-adapter#user-management)

##### Returns

`Awaitable`\<`JWT` \| `null`\>

#### redirect()?

> `optional` **redirect**: (`params`) => `Awaitable`\<`string`\>

This callback is called anytime the user is redirected to a callback URL (i.e. on signin or signout).
By default only URLs on the same host as the origin are allowed.
You can use this callback to customise that behaviour.

[Documentation](https://authjs.dev/reference/core/types#redirect)

##### Parameters

###### params

###### baseUrl

`string`

Default base URL of site (can be used as fallback)

###### url

`string`

URL provided as callback URL by the client

##### Returns

`Awaitable`\<`string`\>

##### Example

```ts
callbacks: {
  async redirect({ url, baseUrl }) {
    // Allows relative callback URLs
    if (url.startsWith("/")) return `${baseUrl}${url}`

    // Allows callback URLs on the same origin
    if (new URL(url).origin === baseUrl) return url

    return baseUrl
  }
}
```

#### session()?

> `optional` **session**: (`params`) => `Awaitable`\<`Session` \| `DefaultSession`\>

This callback is called whenever a session is checked.
(i.e. when invoking the `/api/session` endpoint, using `useSession` or `getSession`).
The return value will be exposed to the client, so be careful what you return here!
If you want to make anything available to the client which you've added to the token
through the JWT callback, you have to explicitly return it here as well.

:::note
⚠ By default, only a subset (email, name, image)
of the token is returned for increased security.
:::

The token argument is only available when using the jwt session strategy, and the
user argument is only available when using the database session strategy.

[`jwt` callback](https://authjs.dev/reference/core/types#jwt)

##### Parameters

###### params

`object` & `object` & `object`

##### Returns

`Awaitable`\<`Session` \| `DefaultSession`\>

##### Example

```ts
callbacks: {
  async session({ session, token, user }) {
    // Send properties to the client, like an access_token from a provider.
    session.accessToken = token.accessToken

    return session
  }
}
```

#### signIn()?

> `optional` **signIn**: (`params`) => `Awaitable`\<`string` \| `boolean`\>

Controls whether a user is allowed to sign in or not.
Returning `true` continues the sign-in flow.
Returning `false` or throwing an error will stop the sign-in flow and redirect the user to the error page.
Returning a string will redirect the user to the specified URL.

Unhandled errors will throw an `AccessDenied` with the message set to the original error.

[`AccessDenied`](https://authjs.dev/reference/core/errors#accessdenied)

##### Parameters

###### params

###### account

`Account` \| `null`

###### credentials?

`Record`\<`string`, `CredentialInput`\>

If Credentials provider is used, it contains the user credentials

###### email?

\{ `verificationRequest?`: `boolean`; \}

If Email provider is used, on the first call, it contains a
`verificationRequest: true` property to indicate it is being triggered in the verification request flow.
When the callback is invoked after a user has clicked on a sign in link,
this property will not be present. You can check for the `verificationRequest` property
to avoid sending emails to addresses or domains on a blocklist or to only explicitly generate them
for email address in an allow list.

###### email.verificationRequest?

`boolean`

###### profile?

`Profile`

If OAuth provider is used, it contains the full
OAuth profile returned by your provider.

###### user

`User` \| `AdapterUser`

##### Returns

`Awaitable`\<`string` \| `boolean`\>

##### Example

```ts
callbacks: {
 async signIn({ profile }) {
  // Only allow sign in for users with email addresses ending with "yourdomain.com"
  return profile?.email?.endsWith("@yourdomain.com")
}
```

#### Inherited from

`Omit.callbacks`

***

### cookies?

> `optional` **cookies**: `Partial`\<`CookiesOptions`\>

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:456

You can override the default cookie names and options for any of the cookies used by Auth.js.
You can specify one or more cookies with custom properties
and missing options will use the default values defined by Auth.js.
If you use this feature, you will likely want to create conditional behavior
to support setting different cookies policies in development and production builds,
as you will be opting out of the built-in dynamic policy.

- ⚠ **This is an advanced option.** Advanced options are passed the same way as basic options,
but **may have complex implications** or side effects.
You should **try to avoid using advanced options** unless you are very comfortable using them.

#### Default

```ts
{}
```

#### Inherited from

`Omit.cookies`

***

### debug?

> `optional` **debug**: `boolean`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:396

Set debug to true to enable debug messages for authentication and database operations.

- ⚠ If you added a custom [AuthConfig.logger](#logger), this setting is ignored.

#### Default

```ts
false
```

#### Inherited from

`Omit.debug`

***

### events?

> `optional` **events**: `object`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:341

Events are asynchronous functions that do not return a response, they are useful for audit logging.
You can specify a handler for any of these events below - e.g. for debugging or to create an audit log.
The content of the message object varies depending on the flow
(e.g. OAuth or Email authentication flow, JWT or database sessions, etc),
but typically contains a user object and/or contents of the JSON Web Token
and other information relevant to the event.

#### createUser()?

> `optional` **createUser**: (`message`) => `Awaitable`\<`void`\>

##### Parameters

###### message

###### user

`User`

##### Returns

`Awaitable`\<`void`\>

#### linkAccount()?

> `optional` **linkAccount**: (`message`) => `Awaitable`\<`void`\>

##### Parameters

###### message

###### account

`Account`

###### profile

`User` \| `AdapterUser`

###### user

`User` \| `AdapterUser`

##### Returns

`Awaitable`\<`void`\>

#### session()?

> `optional` **session**: (`message`) => `Awaitable`\<`void`\>

The message object will contain one of these depending on
if you use JWT or database persisted sessions:
- `token`: The JWT for this session.
- `session`: The session object from your adapter.

##### Parameters

###### message

###### session

`Session`

###### token

`JWT`

##### Returns

`Awaitable`\<`void`\>

#### signIn()?

> `optional` **signIn**: (`message`) => `Awaitable`\<`void`\>

If using a `credentials` type auth, the user is the raw response from your
credential provider.
For other providers, you'll get the User object from your adapter, the account,
and an indicator if the user was new to your Adapter.

##### Parameters

###### message

###### account

`Account` \| `null`

###### isNewUser?

`boolean`

###### profile?

`Profile`

###### user

`User`

##### Returns

`Awaitable`\<`void`\>

#### signOut()?

> `optional` **signOut**: (`message`) => `Awaitable`\<`void`\>

The message object will contain one of these depending on
if you use JWT or database persisted sessions:
- `token`: The JWT for this session.
- `session`: The session object from your adapter that is being ended.

##### Parameters

###### message

\{ `session`: `void` \| `AdapterSession` \| `null` \| `undefined`; \} | \{ `token`: `JWT` \| `null`; \}

##### Returns

`Awaitable`\<`void`\>

#### updateUser()?

> `optional` **updateUser**: (`message`) => `Awaitable`\<`void`\>

##### Parameters

###### message

###### user

`User`

##### Returns

`Awaitable`\<`void`\>

#### Default

```ts
{}
```

#### Inherited from

`Omit.events`

***

### experimental?

> `optional` **experimental**: `object`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:507

Use this option to enable experimental features.
When enabled, it will print a warning message to the console.

#### enableWebAuthn?

> `optional` **enableWebAuthn**: `boolean`

Enable WebAuthn support.

##### Default

```ts
false
```

#### Note

Experimental features are not guaranteed to be stable and may change or be removed without notice. Please use with caution.

#### Default

```ts
{}
```

#### Inherited from

`Omit.experimental`

***

### jwt?

> `optional` **jwt**: `Partial`\<`JWTOptions`\>

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:131

JSON Web Tokens are enabled by default if you have not specified an [AuthConfig.adapter](#adapter).
JSON Web Tokens are encrypted (JWE) by default. We recommend you keep this behaviour.

#### Inherited from

`Omit.jwt`

***

### logger?

> `optional` **logger**: `Partial`\<`LoggerInstance`\>

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:426

Override any of the logger levels (`undefined` levels will use the built-in logger),
and intercept logs in NextAuth. You can use this option to send NextAuth logs to a third-party logging service.

#### Example

```ts
// /auth.ts
import log from "logging-service"

export const { handlers, auth, signIn, signOut } = NextAuth({
  logger: {
    error(code, ...message) {
      log.error(code, message)
    },
    warn(code, ...message) {
      log.warn(code, message)
    },
    debug(code, ...message) {
      log.debug(code, message)
    }
  }
})
```

- ⚠ When set, the [AuthConfig.debug](#debug) option is ignored

#### Default

```ts
console
```

#### Inherited from

`Omit.logger`

***

### pages?

> `optional` **pages**: `Partial`\<`PagesOptions`\>

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:149

Specify URLs to be used if you want to create custom sign in, sign out and error pages.
Pages specified will override the corresponding built-in page.

#### Default

```ts
{}
```

#### Example

```ts
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
    newUser: '/auth/new-user'
  }
```

#### Inherited from

`Omit.pages`

***

### providers

> **providers**: `Provider`[]

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:74

List of authentication providers for signing in
(e.g. Google, Facebook, Twitter, GitHub, Email, etc) in any order.
This can be one of the built-in providers or an object with a custom provider.

#### Default

```ts
[]
```

#### Inherited from

`Omit.providers`

***

### redirectProxyUrl?

> `optional` **redirectProxyUrl**: `string`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:500

When set, during an OAuth sign-in flow,
the `redirect_uri` of the authorization request
will be set based on this value.

This is useful if your OAuth Provider only supports a single `redirect_uri`
or you want to use OAuth on preview URLs (like Vercel), where you don't know the final deployment URL beforehand.

The url needs to include the full path up to where Auth.js is initialized.

#### Note

This will auto-enable the `state` OAuth2Config.checks on the provider.

#### Examples

```
"https://authjs.example.com/api/auth"
```

You can also override this individually for each provider.

```ts
GitHub({
  ...
  redirectProxyUrl: "https://github.example.com/api/auth"
})
```

#### Default

`AUTH_REDIRECT_PROXY_URL` environment variable

See also: [Guide: Securing a Preview Deployment](https://authjs.dev/getting-started/deployment#securing-a-preview-deployment)

#### Inherited from

`Omit.redirectProxyUrl`

***

### secret?

> `optional` **secret**: `string` \| `string`[]

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:86

A random string used to hash tokens, sign cookies and generate cryptographic keys.

To generate a random string, you can use the Auth.js CLI: `npx auth secret`

#### Note

You can also pass an array of secrets, in which case the first secret that successfully
decrypts the JWT will be used. This is useful for rotating secrets without invalidating existing sessions.
The newer secret should be added to the start of the array, which will be used for all new sessions.

#### Inherited from

`Omit.secret`

***

### session?

> `optional` **session**: `object`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:91

Configure your session like if you want to use JWT or a database,
how long until an idle session expires, or to throttle write operations in case you are using a database.

#### generateSessionToken()?

> `optional` **generateSessionToken**: () => `string`

Generate a custom session token for database-based sessions.
By default, a random UUID or string is generated depending on the Node.js version.
However, you can specify your own custom string (such as CUID) to be used.

##### Returns

`string`

##### Default

`randomUUID` or `randomBytes.toHex` depending on the Node.js version

#### maxAge?

> `optional` **maxAge**: `number`

Relative time from now in seconds when to expire the session

##### Default

```ts
2592000 // 30 days
```

#### strategy?

> `optional` **strategy**: `"database"` \| `"jwt"`

Choose how you want to save the user session.
The default is `"jwt"`, an encrypted JWT (JWE) in the session cookie.

If you use an `adapter` however, we default it to `"database"` instead.
You can still force a JWT session by explicitly defining `"jwt"`.

When using `"database"`, the session cookie will only contain a `sessionToken` value,
which is used to look up the session in the database.

[Documentation](https://authjs.dev/reference/core#authconfig#session) | [Adapter](https://authjs.dev/reference/core#authconfig#adapter) | [About JSON Web Tokens](https://authjs.dev/concepts/session-strategies#jwt-session)

#### updateAge?

> `optional` **updateAge**: `number`

How often the session should be updated in seconds.
If set to `0`, session is updated every time.

##### Default

```ts
86400 // 1 day
```

#### Inherited from

`Omit.session`

***

### skipCSRFCheck?

> `optional` **skipCSRFCheck**: *typeof* `skipCSRFCheck`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:467

#### Inherited from

`Omit.skipCSRFCheck`

***

### theme?

> `optional` **theme**: `Theme`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:428

Changes the theme of built-in [AuthConfig.pages](#pages).

#### Inherited from

`Omit.theme`

***

### trustHost?

> `optional` **trustHost**: `boolean`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:466

Auth.js relies on the incoming request's `host` header to function correctly. For this reason this property needs to be set to `true`.

Make sure that your deployment platform sets the `host` header safely.

:::note
Official Auth.js-based libraries will attempt to set this value automatically for some deployment platforms (eg.: Vercel) that are known to set the `host` header safely.
:::

#### Inherited from

`Omit.trustHost`

***

### useSecureCookies?

> `optional` **useSecureCookies**: `boolean`

Defined in: node\_modules/.pnpm/@auth+core@0.34.3/node\_modules/@auth/core/index.d.ts:441

When set to `true` then all cookies set by NextAuth.js will only be accessible from HTTPS URLs.
This option defaults to `false` on URLs that start with `http://` (e.g. http://localhost:3000) for developer convenience.
You can manually set this option to `false` to disable this security feature and allow cookies
to be accessible from non-secured URLs (this is not recommended).

- ⚠ **This is an advanced option.** Advanced options are passed the same way as basic options,
but **may have complex implications** or side effects.
You should **try to avoid using advanced options** unless you are very comfortable using them.

The default is `false` HTTP and `true` for HTTPS sites.

#### Inherited from

`Omit.useSecureCookies`
