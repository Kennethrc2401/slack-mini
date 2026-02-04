import { useQuery } from "convex/react";

import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseGetMembersProps {
    workspaceId: Id<"workspaces">;
};

export const useGetMembers = ({ workspaceId }: UseGetMembersProps) => {
    const { userId } = useAuth();
    const data = useQuery(
        api.members.get,
        (workspaceId && userId)
            ? { workspaceId, userId: userId as Id<"users"> }
            : "skip"
    );
    const isLoading = data === undefined;

    return {
        data,
        isLoading,
    };
}; 
