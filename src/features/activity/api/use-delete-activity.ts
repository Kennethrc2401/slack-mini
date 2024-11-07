import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseDeleteActivityProps {
    activityId: Id<"activity">;
}

export const useDeleteActivity = () => {
    const mutateDeleteActivity = useMutation(api.activity.remove);

    const deleteActivity = async ({ activityId }: UseDeleteActivityProps) => {
        try {
            await mutateDeleteActivity({ activityId });
        } catch (error) {
            console.error("Failed to update read status:", error);
        }
    };

    return { deleteActivity };
};
