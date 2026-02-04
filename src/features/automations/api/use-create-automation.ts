import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCallback } from "react";

export const useCreateAutomation = () => {
    const { userId } = useAuth();
    const mutation = useMutation(api.automations.create);

    const create = useCallback(
        async (
            workspaceId: Id<"workspaces">,
            type: string,
            channelId: Id<"channels">,
            time: string,
            timezone: string,
        ) => {
            if (!userId) throw new Error("Not authenticated");

            return await mutation({
                workspaceId,
                type,
                channelId,
                time,
                timezone,
                userId: userId as Id<"users">,
            });
        },
        [mutation, userId],
    );

    return { create, isLoading: false };
};
