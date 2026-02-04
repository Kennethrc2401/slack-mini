import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseGetWorkspaceProps {
    id: Id<"workspaces">; 
}

export const useGetWorkspace = ({ id }: UseGetWorkspaceProps) => {
    const { userId } = useAuth();
    const data = useQuery(
        api.workspaces.getById,
        (id && userId)
            ? { id, userId: userId as Id<"users"> }
            : "skip"
    );
    
    const isLoading = data === undefined;

    // Determine if there's an error (could customize this further if needed)
    const hasError = !data && !isLoading;

    return {
        data,
        isLoading,
        hasError,
    };
};
