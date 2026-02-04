import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseGetUserActivitiesProps {
    workspaceId: Id<"workspaces">;
}

export const useGetUserActivities = ({ workspaceId }: UseGetUserActivitiesProps) => {
    const { userId } = useAuth();
    const data = useQuery(
        api.activity.getUserActivities,
        (workspaceId && userId)
            ? { workspaceId, userId: userId as Id<"users"> }
            : "skip"
    );
    const isLoading = data === undefined;

    return { data, isLoading };
};

