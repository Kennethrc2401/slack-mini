import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface UseMentionMemberArgs {
    workspaceId: Id<"workspaces">;
    messageId: Id<"messages">;
    mentionedMemberId: Id<"members">;
}

export const useMentionMember = () => {
    const mentionMember = useMutation(api.mentions.createMention);

    return ({ workspaceId, messageId, mentionedMemberId }: UseMentionMemberArgs) =>
        mentionMember({ workspaceId, messageId, mentionedMemberId });
};