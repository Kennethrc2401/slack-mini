import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseGetConversationsProps {
    workspaceId: Id<"workspaces">;
}

export const useGetConversations = ({ workspaceId }: UseGetConversationsProps) => {
    const { userId } = useAuth();
    const data = useQuery(
        api.dms.getConversations,
        (workspaceId && userId)
            ? { workspaceId, userId: userId as Id<"users"> }
            : "skip"
    );
    const isLoading = data === undefined;

    return { data, isLoading };
};

interface UseGetMessagesProps {
    workspaceId: Id<"workspaces">;
    memberId: Id<"members">;
}

export const useGetMessages = ({ workspaceId, memberId }: UseGetMessagesProps) => {
    const { userId } = useAuth();
    const data = useQuery(
        api.dms.getMessages,
        (workspaceId && memberId && userId)
            ? { workspaceId, memberId, userId: userId as Id<"users"> }
            : "skip"
    );
    const isLoading = data === undefined;

    return { data, isLoading };
};

// Keep the old export for backwards compatibility (deprecated)
interface UseGetDMsProps {
    workspaceId: Id<"workspaces">;
    memberId: Id<"members">;
}

export const useGetDMs = ({ workspaceId, memberId }: UseGetDMsProps) => {
    const { userId } = useAuth();
    const data = useQuery(
        api.dms.getMessages,
        (workspaceId && memberId && userId)
            ? { memberId, workspaceId, userId: userId as Id<"users"> }
            : "skip"
    );
    const isLoading = data === undefined;

    return { data, isLoading };
};

