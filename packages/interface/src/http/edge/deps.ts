import type { EdgeDeps } from "./app";

/**
 * Create Edge runtime dependencies for the HTTP app.
 *
 * - `createTodo` uses `crypto.randomUUID` when available, falling back to
 *   a pseudo-random id with an `edge-` prefix.
 * - `listTodos` returns a static list for demonstration.
 */
export function makeEdgeDeps(): EdgeDeps {
  return {
    async createTodo(input) {
      return {
        id:
          crypto.randomUUID?.() ??
          `edge-${Math.random().toString(16).slice(2)}`,
        title: input.title,
      };
    },
    async listTodos() {
      return [
        { id: "edge-1", title: "Edge todo 1" },
        { id: "edge-2", title: "Edge todo 2" },
      ];
    },
  };
}
