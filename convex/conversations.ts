import { v } from "convex/values"; 
import { mutation } from "./_generated/server";
import { auth } from "./auth";

export const createOrGet = mutation({
    args: {
        memberId: v.id("members"),
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Ensure that currentMember retrieves the actual member object
        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.workspaceId).eq("userId", userId)
            )
            .unique(); // Use .unique() to get a single member

        // Ensure that otherMember is retrieved correctly
        const otherMember = await ctx.db.get(args.memberId);

        if (!currentMember || !otherMember) {
            throw new Error("Member not found");
        }

        // Proceed with checking for an existing conversation
        const existingConversation = await ctx.db
            .query("conversations")
            .filter((q) => q.eq(q.field("workspaceId"), args.workspaceId))
            .filter((q) =>
                q.or(
                    q.and(
                        q.eq(q.field("memberOneId"), currentMember._id), // Access _id from currentMember
                        q.eq(q.field("memberTwoId"), otherMember._id)
                    ),
                    q.and(
                        q.eq(q.field("memberOneId"), otherMember._id),
                        q.eq(q.field("memberTwoId"), currentMember._id)
                    )
                )
            )
            .unique();

        if (existingConversation) {
            return existingConversation._id;
        }

        // If no existing conversation, create a new one
        const conversationId = await ctx.db.insert("conversations", {
            workspaceId: args.workspaceId,
            memberOneId: currentMember._id, // Use _id from currentMember
            memberTwoId: otherMember._id,   // Use _id from otherMember
        });

        return conversationId;
    },
});
