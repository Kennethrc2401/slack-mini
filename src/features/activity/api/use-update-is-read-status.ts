import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseUpdateIsReadStatusProps {
    activityId: Id<"activity">;
    isRead: boolean;
}

export const useUpdateIsReadStatus = () => {
    const mutateUpdateIsReadStatus = useMutation(api.activity.update);
    const { userId } = useAuth();

    const updateIsReadStatus = async ({ activityId, isRead }: UseUpdateIsReadStatusProps) => {
        try {
            if (!userId) {
                throw new Error("User not authenticated");
            }

            await mutateUpdateIsReadStatus({ activityId, isRead, userId: userId as Id<"users"> });
        } catch (error) {
            console.error("Failed to update read status:", error);
        }
    };

    return { updateIsReadStatus };
};

