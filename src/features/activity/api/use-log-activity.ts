import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseLogActivityProps {
    messageId: Id<"messages">;
    workspaceId: Id<"workspaces">;
    actionType: "reply" | "mention" | "new_message";
    conversationId?: Id<"conversations">;
    initiatorMemberId?: Id<"members">;
    actionDetails?: string;
}

export const useLogActivity = () => {
    const logActivity = useMutation(api.activity.logActivity);

    const handleLogActivity = async ({
        messageId,
        workspaceId,
        actionType,
        conversationId,
        initiatorMemberId,
        actionDetails,
    }: UseLogActivityProps) => {
        try {
            await logActivity({
                messageId,
                workspaceId,
                actionType,
                conversationId,
                initiatorMemberId,
                actionDetails,
            });
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    };

    return handleLogActivity;
};
