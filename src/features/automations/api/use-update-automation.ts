import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCallback } from "react";

export const useUpdateAutomation = () => {
    const { userId } = useAuth();
    const mutation = useMutation(api.automations.update);

    const update = useCallback(
        async (
            automationId: Id<"automations">,
            updates: {
                isActive?: boolean;
                time?: string;
                timezone?: string;
                channelId?: Id<"channels">;
            },
        ) => {
            if (!userId) throw new Error("Not authenticated");

            return await mutation({
                id: automationId,
                ...updates,
                userId: userId as Id<"users">,
            });
        },
        [mutation, userId],
    );

    return { update, isLoading: false };
};
