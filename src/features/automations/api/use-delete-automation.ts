import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useCallback } from "react";

export const useDeleteAutomation = () => {
    const { userId } = useAuth();
    const mutation = useMutation(api.automations.remove);

    const remove = useCallback(
        async (automationId: Id<"automations">) => {
            if (!userId) throw new Error("Not authenticated");

            return await mutation({
                id: automationId,
                userId: userId as Id<"users">,
            });
        },
        [mutation, userId],
    );

    return { remove, isLoading: false };
};
