import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseDeleteActivityProps {
    activityId: Id<"activity">;
}

export const useDeleteActivity = () => {
    const mutateDeleteActivity = useMutation(api.activity.remove);
    const { userId } = useAuth();

    const deleteActivity = async ({ activityId }: UseDeleteActivityProps) => {
        try {
            if (!userId) {
                throw new Error("User not authenticated");
            }

            await mutateDeleteActivity({ activityId, userId: userId as Id<"users"> });
        } catch (error) {
            console.error("Failed to update read status:", error);
        }
    };

    return { deleteActivity };
};

