import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetMemberPreferencesProps {
    workspaceId: Id<"workspaces">;
    memberId: Id<"members"> | undefined;
    theme?: "light" | "dark" | "system" | "lgbtq" | "trans" | "lesbian" | "bi" | "gay" | "queer";
}

export const useGetMemberPreferences = ({ 
    workspaceId,
    memberId,
    theme,
}: UseGetMemberPreferencesProps) => {
  const data = useQuery(api.userPreferences.getMemberPreferencesById, memberId ? {
    workspaceId,
    memberId,
    theme,
   } : "skip");
  const isLoading = data === undefined;
  const isError = !memberId;

  return { data, isLoading, isError };
};
