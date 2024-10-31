// hooks/useUpdateTodo.ts
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UpdateTodoArgs {
  todoId: Id<"todos">;
  isComplete: boolean;
}

export const useUpdateTodo = () => {
  const updateTodo = useMutation(api.todos.updateTodo);
  return ({ todoId, isComplete }: UpdateTodoArgs) => updateTodo({ todoId, isComplete });
};
