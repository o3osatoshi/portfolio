import { z } from "zod";

/**
 * Schema for the request payload to create a todo via HTTP.
 *
 * Fields:
 * - title: Non-empty string.
 */
export const CreateTodoInput = z.object({
  title: z.string().min(1),
});
/** Inferred TypeScript type for {@link CreateTodoInput} schema. */
export type CreateTodoInput = z.infer<typeof CreateTodoInput>;

/**
 * Schema representing a todo resource returned from the API.
 */
export const Todo = z.object({
  id: z.string(),
  title: z.string(),
});
/** Inferred TypeScript type for {@link Todo} schema. */
export type Todo = z.infer<typeof Todo>;

/** Schema representing a list of todos. */
export const TodoList = z.array(Todo);
/** Inferred TypeScript type for {@link TodoList} schema. */
export type TodoList = z.infer<typeof TodoList>;
