import { z } from "zod";

/**
 * Example DTOs used in documentation and tests.
 * These are not wired to the current public routes.
 *
 * CreateTodoInput — minimal example input schema with a single `title` field.
 */
export const CreateTodoInput = z.object({
  title: z.string().min(1),
});
/** Inferred TypeScript type for {@link CreateTodoInput} schema. */
export type CreateTodoInput = z.infer<typeof CreateTodoInput>;

/**
 * Example schema representing a todo resource.
 */
export const Todo = z.object({
  id: z.string(),
  title: z.string(),
});
/** Inferred TypeScript type for {@link Todo} schema. */
export type Todo = z.infer<typeof Todo>;

/** Example schema representing a list of todos. */
export const TodoList = z.array(Todo);
/** Inferred TypeScript type for {@link TodoList} schema. */
export type TodoList = z.infer<typeof TodoList>;
