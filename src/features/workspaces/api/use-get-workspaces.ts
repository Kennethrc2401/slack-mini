import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { useAuthContext } from "../../auth/auth-context";

export const useGetWorkspaces = () => {
    const { email } = useAuthContext();
    
    // Fetch all workspaces using email-based query
    const data = useQuery(api.workspaces.getByEmail, email ? { email } : "skip");
    
    // Determine if data is still loading
    const isLoading = data === undefined;
    
    // Determine if there's an error (could customize this further if needed)
    const hasError = !data && !isLoading;

    return {
        data: !hasError ? data : null, // Return `null` if there's an error
        isLoading,
        error: hasError ? "Failed to fetch workspaces" : null, // Provide an error message if the fetch fails
    };
};
