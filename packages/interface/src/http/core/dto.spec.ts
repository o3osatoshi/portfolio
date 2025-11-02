import { describe, expect, it } from "vitest";

import { CreateTodoInput, Todo, TodoList } from "./dto";

describe("dto", () => {
  it("validates CreateTodoInput", () => {
    const ok = CreateTodoInput.safeParse({ title: "Buy milk" });
    expect(ok.success).toBe(true);

    const ng = CreateTodoInput.safeParse({ title: "" });
    expect(ng.success).toBe(false);
  });

  it("validates Todo and TodoList", () => {
    const todo = { id: "todo-1", title: "Task" };
    expect(Todo.parse(todo)).toEqual(todo);

    const list = [todo];
    expect(TodoList.parse(list)).toEqual(list);
  });
});
