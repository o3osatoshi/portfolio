# @o3osatoshi/logging

## 0.2.0

### Minor Changes

- [#90](https://github.com/o3osatoshi/portfolio/pull/90) [`ba6e5ae`](https://github.com/o3osatoshi/portfolio/commit/ba6e5ae46a4700e8e9bb396dbc0b0ff680e3a01d) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - Expose `appendErrorAttributes` from the root logging entrypoint and broaden runtime transport error callbacks to accept unknown errors.

  Improve proxy and Next.js error attribute enrichment, update Axiom-related dependencies, and keep watch builds from cleaning output between rebuilds.

### Patch Changes

- Updated dependencies [[`ba6e5ae`](https://github.com/o3osatoshi/portfolio/commit/ba6e5ae46a4700e8e9bb396dbc0b0ff680e3a01d), [`ba6e5ae`](https://github.com/o3osatoshi/portfolio/commit/ba6e5ae46a4700e8e9bb396dbc0b0ff680e3a01d)]:
  - @o3osatoshi/config@1.2.0
  - @o3osatoshi/toolkit@1.2.0

## 0.1.0

### Minor Changes

- [#54](https://github.com/o3osatoshi/portfolio/pull/54) [`d2efb58`](https://github.com/o3osatoshi/portfolio/commit/d2efb580b2bf66ad97014d549c462e20da49aed2) Thanks [@o3osatoshi](https://github.com/o3osatoshi)! - - Initial release of the Axiom-first logging helpers for Node, Edge, and browser runtimes.
  - Request-scoped loggers with trace context, structured events, and metrics.
  - Proxy transport + Next.js helper integrations for bridging Axiom helpers into the shared logger.

### Patch Changes

- Updated dependencies [[`d2efb58`](https://github.com/o3osatoshi/portfolio/commit/d2efb580b2bf66ad97014d549c462e20da49aed2), [`d2efb58`](https://github.com/o3osatoshi/portfolio/commit/d2efb580b2bf66ad97014d549c462e20da49aed2)]:
  - @o3osatoshi/config@1.1.1
  - @o3osatoshi/toolkit@1.1.0
