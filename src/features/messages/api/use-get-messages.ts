import { usePaginatedQuery } from "convex/react";

import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

const BATCH_SIZE = 20;

interface UseGetMessagesProps {
    channelId?: Id<"channels">;
    conversationId?: Id<"conversations">;
    parentMessageId?: Id<"messages">;
};

export type GetMessagesReturnType = typeof api.messages.get._returnType["page"];

export const useGetMessages = ({
    channelId,
    conversationId,
    parentMessageId
}: UseGetMessagesProps) => {
    const { userId } = useAuth();
    const { results, status, loadMore } = usePaginatedQuery(
        api.messages.get,
        userId ? {
            channelId,
            conversationId,
            parentMessageId,
            userId: userId as Id<"users">,
        } : "skip",
        {
            initialNumItems: BATCH_SIZE,
        }
    );

    return {
        results,
        status,
        loadMore: () => loadMore(BATCH_SIZE),
    }
};
