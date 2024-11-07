import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseUpdateIsReadStatusProps {
    activityId: Id<"activity">;
    isRead: boolean;
}

export const useUpdateIsReadStatus = () => {
    const mutateUpdateIsReadStatus = useMutation(api.activity.update);

    const updateIsReadStatus = async ({ activityId, isRead }: UseUpdateIsReadStatusProps) => {
        try {
            await mutateUpdateIsReadStatus({ activityId, isRead });
        } catch (error) {
            console.error("Failed to update read status:", error);
        }
    };

    return { updateIsReadStatus };
};
