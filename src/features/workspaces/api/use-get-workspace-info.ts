import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetWorkspaceInfoProps {
    id: Id<"workspaces">; // Make id required
}

export const useGetWorkspaceInfo = ({ id }: UseGetWorkspaceInfoProps) => {
    if (!id) {
        throw new Error("id is required");
    }
    
    const data = useQuery(api.workspaces.getInfoById, { id });
    
    const isLoading = data === undefined;

    // Determine if there's an error (could customize this further if needed)
    const hasError = !data && !isLoading;

    return {
        data,
        isLoading,
        hasError,
    };
};