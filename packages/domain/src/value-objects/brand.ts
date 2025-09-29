/**
 * Utility type implementing nominal typing through an opaque string brand.
 */
export type Brand<T, B extends string> = { readonly __brand: B } & T;
