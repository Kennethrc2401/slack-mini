import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetDMsProps {
    workspaceId: Id<"workspaces">;
    memberId: Id<"members">;
}

export const useGetDMs = ({ workspaceId, memberId }: UseGetDMsProps) => {
    const data = useQuery(api.dms.getDMs, { memberId, workspaceId });
    const isLoading = data === undefined;

    return { data, isLoading };
};
