import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseGetThreadsProps {
    workspaceId: Id<"workspaces">;
}

export const useGetThreads = ({ workspaceId }: UseGetThreadsProps) => {
    const { userId } = useAuth();
    const data = useQuery(
        api.messages.getThreads,
        (workspaceId && userId)
            ? { workspaceId, userId: userId as Id<"users"> }
            : "skip"
    );
    
    return { data, isLoading: data === undefined };
};

