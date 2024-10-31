import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface CreateTodoArgs {
  workspaceId: Id<"workspaces">;
  task: string;
}

export const useCreateTodo = () => {
  const createTodo = useMutation(api.todos.createTodo);
  return ({ workspaceId, task }: CreateTodoArgs) => createTodo({ workspaceId, task });
};
