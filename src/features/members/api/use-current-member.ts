import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseCurrentMemberProps {
    workspaceId: Id<"workspaces"> | undefined;
};

export const useCurrentMember = ({ workspaceId }: UseCurrentMemberProps) => {
    const { userId } = useAuth();
    const data = useQuery(api.members.current, (workspaceId && userId) ? { workspaceId, userId: userId as Id<"users"> } : "skip");
    const isLoading = data === undefined;
    const isError = !workspaceId;

    return {
        data,
        isLoading,
        isError,
    };
};
