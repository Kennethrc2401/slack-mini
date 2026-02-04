import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/features/auth/hooks/use-auth";

interface UseLogActivityProps {
    messageId?: Id<"messages">;
    workspaceId: Id<"workspaces">;
    actionType: "reply" | "mention" | "new_message" | "reaction";
    conversationId?: Id<"conversations">;
    initiatorMemberId?: Id<"members">;
    actionDetails?: string;
    initiatorName: string;
}

export const useLogActivity = () => {
    const logActivity = useMutation(api.activity.logActivity);
    const { userId } = useAuth();

    const handleLogActivity = async ({
        messageId,
        workspaceId,
        actionType,
        conversationId,
        initiatorMemberId,
        actionDetails,
        initiatorName,
    }: UseLogActivityProps) => {
        try {
            if (!userId) {
                throw new Error("User not authenticated");
            }

            await logActivity({
                messageId,
                workspaceId,
                actionType,
                conversationId,
                initiatorMemberId,
                actionDetails,
                initiatorName,
                userId: userId as Id<"users">,
            });
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    };

    return handleLogActivity;
};

