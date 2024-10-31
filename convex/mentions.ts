// mentions.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { auth } from "./auth";

// Mutation to log a mention
export const createMention = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        messageId: v.id("messages"),
        mentionedMemberId: v.id("members"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) throw new Error("Unauthorized");

        const mentioningMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .first();
        if (!mentioningMember) throw new Error("Mentioning member not found");

        await ctx.db.insert("mentions", {
            workspaceId: args.workspaceId,
            messageId: args.messageId,
            mentionedMemberId: args.mentionedMemberId,
            mentioningMemberId: mentioningMember._id,
            createdAt: Date.now(),
        });
    },
});
