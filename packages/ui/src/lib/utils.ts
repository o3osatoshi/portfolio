import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS class names while de-duplicating conflicting utilities.
 *
 * Combines `clsx` for conditional class handling with `tailwind-merge` to
 * ensure later utilities take precedence (e.g. `p-2` overrides `p-4`). This is
 * the canonical helper exported by the UI package for composing component
 * classes.
 *
 * @param inputs - Class name fragments or conditional tuples accepted by `clsx`.
 * @returns A single space-delimited class name string safe to pass to React elements.
 * @public
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
