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
    if (task.trim()) {
      createTodo({ workspaceId, task });
      setTask("");
    } else {
      alert("Please enter a task.");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
     <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">To-Do List</h1>

      {/* Input Section */}
      <div className="flex gap-2 mb-8">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Add a new task..."
          className="border p-2 rounded w-full shadow-sm"
          onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
        />
        <button
          onClick={handleAddTask}
          disabled={!task.trim()}
          className="bg-blue-500 text-white p-2 rounded shadow-md hover:bg-blue-600 transition disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {todos?.map((todo) => (
          <div
            key={todo._id}
            className={`p-4 rounded-lg shadow-md border transition-transform transform ${
              todo.isComplete ? "bg-gray-200" : "bg-white hover:scale-105"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <input
                type="checkbox"
                checked={todo.isComplete}
                onChange={() =>
                  updateTodo({ todoId: todo._id, isComplete: !todo.isComplete })
                }
                className="form-checkbox h-5 w-5 text-blue-500"
              />
              <button
                onClick={() => deleteTodo({ todoId: todo._id })}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </div>
            <div
              className={`text-lg ${
                todo.isComplete ? "line-through text-gray-500" : "text-gray-800"
              }`}
            >
              {todo.task}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodoPage;
