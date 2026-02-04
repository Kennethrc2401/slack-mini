import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface CreateTodoArgs {
  workspaceId: Id<"workspaces">;
  task: string;
}

export const useCreateTodo = () => {
  const createTodo = useMutation(api.todos.createTodo);
  const { userId } = useAuth();
  return ({ workspaceId, task }: CreateTodoArgs) => createTodo({
    workspaceId,
    task,
    userId: userId as Id<"users">,
  });
};

