// Generic brand utility for nominal typing
export type Brand<T, B extends string> = T & { readonly __brand: B };
