import { useQuery } from "convex/react";

import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseGetMessageProps {
    id: Id<"messages">;
};

export const useGetMessage = ({ id }: UseGetMessageProps) => {
    const { userId } = useAuth();
    const data = useQuery(
        api.messages.getById,
        (id && userId)
            ? { id, userId: userId as Id<"users"> }
            : "skip"
    );
    const isLoading = data === undefined;

    return { data, isLoading };
};
