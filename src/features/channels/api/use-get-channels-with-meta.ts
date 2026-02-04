import { useQuery } from "convex/react";

import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseGetChannelsWithMetaProps {
    workspaceId: Id<"workspaces">;
}

export const useGetChannelsWithMeta = ({ workspaceId }: UseGetChannelsWithMetaProps) => {
    const { userId } = useAuth();
    const data = useQuery(
        api.channels.getWithMeta,
        (workspaceId && userId)
            ? { workspaceId, userId: userId as Id<"users"> }
            : "skip"
    );
    const isLoading = data === undefined;

    return { data, isLoading };
};
