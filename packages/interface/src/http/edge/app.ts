import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { CreateTodoInput, Todo, TodoList } from "../core/dto";
import { toHttpError } from "../core/errors";
import { loggerMiddleware, requestIdMiddleware } from "../core/middlewares";

/**
 * Concrete Hono app type for the Edge HTTP interface.
 *
 * Useful for deriving a typed RPC client via `hono/client`.
 */
export type EdgeAppType = ReturnType<typeof buildEdgeApp>;

/**
 * Dependencies required by {@link buildEdgeApp}.
 */
export type EdgeDeps = {
  /** Persist a new todo and return the created resource. */
  createTodo: (input: {
    title: string;
  }) => Promise<{ id: string; title: string }>;
  /** Retrieve all todos visible to the caller. */
  listTodos: () => Promise<Array<{ id: string; title: string }>>;
};

/**
 * Build the Edge-ready HTTP application.
 *
 * Routes (mounted under `/edge`):
 * - GET `/healthz` — Liveness probe.
 * - GET `/todos` — List todos.
 * - POST `/todos` — Create a todo (validated by {@link CreateTodoInput}).
 *
 * Middlewares: {@link requestIdMiddleware}, {@link loggerMiddleware}
 * Errors: domain errors are serialized via {@link toHttpError}.
 *
 * @param deps Implementations of {@link EdgeDeps}.
 * @returns Configured Hono app instance.
 */
export function buildEdgeApp(deps: EdgeDeps) {
  const app = new Hono().basePath("/edge");

  app.use("*", requestIdMiddleware, loggerMiddleware);

  app.get("/healthz", (c) => c.json({ ok: true }));

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
