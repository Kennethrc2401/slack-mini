import { useQuery } from "convex/react";

import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseGetMentionsProps {
    messageId: Id<"messages">;
};

export const useGetMessages = ({ messageId }: UseGetMentionsProps) => {
    const data = useQuery(api.mentions.getMentions, { messageId });
    const isLoading = data === undefined;

    return {
        data,
        isLoading,
    };
}; 