// Generic brand utility for nominal typing
export type Brand<T, B extends string> = { readonly __brand: B } & T;
