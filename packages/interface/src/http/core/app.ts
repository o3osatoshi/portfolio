import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { CreateTodoInput, Todo, TodoList } from "./dto";
import { toHttpError } from "./errors";
import { loggerMiddleware, requestIdMiddleware } from "./middlewares";

/**
 * Server application type representing the Hono routes in this module.
 * Used by typed clients (e.g. `hono/client`).
 */
export type AppType = ReturnType<typeof buildApp>;

/**
 * Runtime-specific dependencies the HTTP app expects.
 * Implementations are provided by each delivery/runtime layer.
 */
export type Deps = {
  /**
   * Create a new todo item.
   * @param input Object containing the todo title.
   * @returns A promise that resolves to the created todo with an id.
   */
  createTodo: (input: {
    title: string;
  }) => Promise<{ id: string; title: string }>;
  /**
   * Retrieve all todo items.
   * @returns A promise that resolves to an array of todos.
   */
  listTodos: () => Promise<Array<{ id: string; title: string }>>;
};

/**
 * Build and configure the Hono application.
 *
 * The app is mounted under the `/api` base path and exposes:
 * - GET `/api/healthz`: Liveness probe.
 * - GET `/api/todos`: Return the current todo list.
 * - POST `/api/todos`: Create a new todo (validated by zod).
 *
 * Common middlewares are applied to all routes: request id and logging.
 *
 * @param deps Injected runtime dependencies implementing data access.
 * @returns Configured Hono app instance.
 */
export function buildApp(deps: Deps) {
  const app = new Hono().basePath("/api");

  app.use("*", requestIdMiddleware, loggerMiddleware);

  app.get("/healthz", (c) => c.json({ ok: true }));

  // GET /api/todos
  app.get("/todos", async (c) => {
    try {
      const todos = await deps.listTodos();
      const parsed = TodoList.parse(todos);
      return c.json(parsed, 200);
    } catch (err) {
      const { body } = toHttpError(err);
      return c.json(body, 500);
    }
  });

  // POST /api/todos
  app.post("/todos", zValidator("json", CreateTodoInput), async (c) => {
    try {
      const input = c.req.valid("json");
      const created = await deps.createTodo(input);
      const parsed = Todo.parse(created);
      return c.json(parsed, 201);
    } catch (err) {
      const { body } = toHttpError(err);
      return c.json(body, 500);
    }
  });

  return app;
}
