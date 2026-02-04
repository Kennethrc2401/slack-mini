import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseMentionMemberArgs {
    workspaceId: Id<"workspaces">;
    messageId: Id<"messages">;
    mentionedMemberId: Id<"members">;
    mentioningMemberId: Id<"members">;
    initiatorName?: string;
}


export const useMentionMember = () => {
    const mentionMember = useMutation(api.mentions.createMention);

    return ({ 
        workspaceId, 
        messageId, 
        mentionedMemberId,
        initiatorName = "",
    }: UseMentionMemberArgs) =>
        mentionMember({ 
            workspaceId, 
            messageId, 
            mentionedMemberId, 
            initiatorName,
         });
};
