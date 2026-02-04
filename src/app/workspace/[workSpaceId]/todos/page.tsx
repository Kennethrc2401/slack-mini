"use client";

import React, { useMemo, useState } from "react";
import { useGetTodos } from "@/features/todos/api/use-get-todos";
import { useCreateTodo } from "@/features/todos/api/use-create-todo";
import { useUpdateTodo } from "@/features/todos/api/use-update-todo";
import { useDeleteTodo } from "@/features/todos/api/use-delete-todo";
import { useWorkspaceId } from "@/hooks/use-workspace-id";

const TodoPage = () => {
  const workspaceId = useWorkspaceId();
  const [task, setTask] = useState("");
  const { data: todos, isLoading } = useGetTodos({ workspaceId });
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const deleteTodo = useDeleteTodo();

  const stats = useMemo(() => {
    const total = todos?.length ?? 0;
    const completed = todos?.filter((todo) => todo.isComplete).length ?? 0;
    const remaining = total - completed;
    return { total, completed, remaining };
  }, [todos]);

  const handleAddTask = () => {
    if (task.trim()) {
      createTodo({ workspaceId, task });
      setTask("");
    } else {
      alert("Please enter a task.");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="rounded-xl border bg-white px-4 py-3 shadow-sm text-sm text-muted-foreground">
          Loading todos...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Todos</h1>
          <p className="text-sm text-muted-foreground">Stay on top of your workspace tasks.</p>
        </div>
        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="rounded-full border bg-white px-3 py-1">Total: {stats.total}</span>
          <span className="rounded-full border bg-white px-3 py-1">Done: {stats.completed}</span>
          <span className="rounded-full border bg-white px-3 py-1">Open: {stats.remaining}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Add a task</h2>
          <p className="text-xs text-muted-foreground">Quickly capture what you need to do.</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="Add a new task..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            />
            <button
              onClick={handleAddTask}
              disabled={!task.trim()}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </div>

        <div className="rounded-2xl border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold">Overview</h2>
          <p className="text-xs text-muted-foreground">Complete tasks to keep this tidy.</p>
          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
              <span>Completed tasks</span>
              <span className="font-semibold">{stats.completed}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2 text-sm">
              <span>Remaining tasks</span>
              <span className="font-semibold">{stats.remaining}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Your tasks</h2>
          <span className="text-xs text-muted-foreground">{stats.total} total</span>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {todos?.length ? (
            todos.map((todo) => (
              <div
                key={todo._id}
                className={`rounded-xl border p-4 transition ${
                  todo.isComplete ? "bg-emerald-50/70 border-emerald-100" : "bg-white hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={todo.isComplete}
                      onChange={() => updateTodo({ todoId: todo._id, isComplete: !todo.isComplete })}
                      className="h-4 w-4 rounded border-muted-foreground/30 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={todo.isComplete ? "line-through text-muted-foreground" : "text-foreground"}>
                      {todo.task}
                    </span>
                  </label>
                  <button
                    onClick={() => deleteTodo({ todoId: todo._id })}
                    className="text-xs text-rose-600 hover:text-rose-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
              No tasks yet. Add your first task to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoPage;
