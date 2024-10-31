import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetUserActivitiesProps {
    workspaceId: Id<"workspaces">;
}

export const useGetUserActivities = ({ workspaceId }: UseGetUserActivitiesProps) => {
    const data = useQuery(api.activity.getUserActivities, { workspaceId });
    const isLoading = data === undefined;

    return { data, isLoading };
};
