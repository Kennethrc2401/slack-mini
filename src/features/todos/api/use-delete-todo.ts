import { useMutation} from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface DeleteTodoArgs {
  todoId: Id<"todos">;
}

export const useDeleteTodo = () => {
  const deleteTodo = useMutation(api.todos.deleteTodo);
  return ({ todoId }: DeleteTodoArgs) => deleteTodo({ todoId });
};
