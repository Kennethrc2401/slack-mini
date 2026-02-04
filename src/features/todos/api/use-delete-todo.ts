import { useMutation} from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface DeleteTodoArgs {
  todoId: Id<"todos">;
}

export const useDeleteTodo = () => {
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const { userId } = useAuth();
  return ({ todoId }: DeleteTodoArgs) => deleteTodo({
    todoId,
    userId: userId as Id<"users">,
  });
};

