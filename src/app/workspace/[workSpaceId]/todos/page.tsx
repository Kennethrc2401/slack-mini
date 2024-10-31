"use client";

import React, { useState } from "react";
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

  const handleAddTask = () => {
    createTodo({ workspaceId, task });
    setTask("");
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">To-Do List</h1>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="New Task"
          className="border p-2 rounded w-full"
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-500 text-white p-2 rounded"
        >
          Add
        </button>
      </div>
      <ul className="mt-6 space-y-2">
        {todos?.map((todo) => (
          <li key={todo._id} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={todo.isComplete}
              onChange={() =>
                updateTodo({ todoId: todo._id, isComplete: !todo.isComplete })
              }
              className="form-checkbox"
            />
            <span className={`${todo.isComplete ? "line-through" : ""}`}>
              {todo.task}
            </span>
            <button
              onClick={() => deleteTodo({ todoId: todo._id })}
              className="text-red-500 ml-auto"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TodoPage;
