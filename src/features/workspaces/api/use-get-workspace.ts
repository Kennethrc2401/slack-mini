import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetWorkspaceProps {
    id: Id<"workspaces">; 
}

export const useGetWorkspace = ({ id }: UseGetWorkspaceProps) => {
    const data = useQuery(api.workspaces.getById, { id });
    
    const isLoading = data === undefined;

    // Determine if there's an error (could customize this further if needed)
    const hasError = !data && !isLoading;

    return {
        data,
        isLoading,
        hasError,
    };
};