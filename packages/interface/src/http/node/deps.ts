import type { Deps } from "../core/app";

/**
 * Create Node.js runtime dependencies for the HTTP app.
 *
 * This implementation is intentionally minimal and in-memory:
 * - `createTodo` generates a pseudo-random id and echoes the title.
 * - `listTodos` returns a static example list.
 *
 * Replace with real infrastructure (DB, services) in production.
 *
 * @returns A concrete {@link Deps} implementation for Node.
 */
export function makeNodeDeps(): Deps {
  return {
    async createTodo(input) {
      return {
        id: `todo-${Math.random().toString(16).slice(2)}`,
        title: input.title,
      };
    },
    async listTodos() {
      return [{ id: "todo-1", title: "Buy milk" }];
    },
  };
}
