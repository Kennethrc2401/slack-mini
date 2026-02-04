import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseGetAutomationsProps {
    workspaceId: Id<"workspaces">;
}

export const useGetAutomations = ({ workspaceId }: UseGetAutomationsProps) => {
    const { userId } = useAuth();
    const data = useQuery(
        api.automations.get,
        workspaceId && userId
            ? { workspaceId, userId: userId as Id<"users"> }
            : "skip",
    );
    const isLoading = data === undefined;

    return { data, isLoading };
};
