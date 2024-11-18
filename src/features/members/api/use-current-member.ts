import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseCurrentMemberProps {
    workspaceId: Id<"workspaces"> | undefined;
};

export const useCurrentMember = ({ workspaceId }: UseCurrentMemberProps) => {
    const data = useQuery(api.members.current, workspaceId ? { workspaceId } : "skip");
    const isLoading = data === undefined;
    const isError = !workspaceId;

    return {
        data,
        isLoading,
        isError,
    };
};