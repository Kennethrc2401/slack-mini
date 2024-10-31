import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetTodosProps {
  workspaceId: Id<"workspaces">;
}

export const useGetTodos = ({ workspaceId }: UseGetTodosProps) => {
  const data = useQuery(api.todos.getTodos, { workspaceId });
  const isLoading = data === undefined;
  return { data, isLoading };
};