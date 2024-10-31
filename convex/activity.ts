import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

export const getUserActivities = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        // Get the current member's information
        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .first();

        if (!currentMember) throw new Error("Member not found");

        // Fetch activities related to this member within the specified workspace
        const activities = await ctx.db
            .query("activity")
            .withIndex("by_workspace_id", (q) => 
                q.eq("workspaceId", args.workspaceId))
            .filter((q) => q.eq(q.field("memberId"), currentMember._id))
            .collect();

        return activities;
    },
});

export const logActivity = mutation({
    args: {
        messageId: v.id("messages"),
        workspaceId: v.id("workspaces"),
        actionType: v.union(v.literal("reply"), v.literal("mention"), v.literal("new_message")),
        conversationId: v.optional(v.id("conversations")),
        initiatorMemberId: v.optional(v.id("members")),
        actionDetails: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .first();

        if (!currentMember) throw new Error("Current member not found.");

        await ctx.db.insert("activity", {
            workspaceId: args.workspaceId,
            conversationId: args.conversationId,
            memberId: currentMember._id,
            messageId: args.messageId,
            initiatorMemberId: args.initiatorMemberId || currentMember._id,
            actionType: args.actionType,
            isRead: false,  // Default to unread for new activity
            actionDetails: args.actionDetails || "",
            createdAt: Date.now(),
        });
    },
});
