// hooks/useUpdateTodo.ts
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UpdateTodoArgs {
  todoId: Id<"todos">;
  isComplete: boolean;
}

export const useUpdateTodo = () => {
  const updateTodo = useMutation(api.todos.updateTodo);
  const { userId } = useAuth();
  return ({ todoId, isComplete }: UpdateTodoArgs) => updateTodo({
    todoId,
    isComplete,
    userId: userId as Id<"users">,
  });
};

