import { describe, expect, it } from "vitest";

import { makeNodeDeps } from "./deps";

describe("node/deps", () => {
  it("creates todo with id prefix", async () => {
    const deps = makeNodeDeps();
    const todo = await deps.createTodo({ title: "T" });
    expect(todo.title).toBe("T");
    expect(todo.id.startsWith("todo-")).toBe(true);
  });

  it("lists todos with at least one item", async () => {
    const deps = makeNodeDeps();
    const list = await deps.listTodos();
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
    expect(typeof list[0]?.id).toBe("string");
    expect(typeof list[0]?.title).toBe("string");
  });
});
