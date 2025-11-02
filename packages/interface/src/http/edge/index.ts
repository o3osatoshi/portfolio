import { buildApp, type Deps } from "../core/app";

/**
 * Minimal dependency implementation for Edge runtime environments.
 *
 * - `createTodo` uses `crypto.randomUUID` when available, falling back to a
 *   pseudo-random id with an `edge-` prefix.
 * - `listTodos` returns a static list for demonstration purposes.
 */
const deps: Deps = {
  async createTodo(input) {
    return {
      id:
        crypto.randomUUID?.() ?? `edge-${Math.random().toString(16).slice(2)}`,
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

/**
 * Hono application configured for Edge runtimes.
 *
 * Routes are the same as the core app (`/api/healthz`, `/api/todos`).
 */
const app = buildApp(deps);
export default app;
