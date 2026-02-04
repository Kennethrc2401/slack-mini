import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const getMember = async (ctx: any, workspaceId: Id<"workspaces">, userId: Id<"users">) => {
    return ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q: any) =>
            q.eq("workspaceId", workspaceId).eq("userId", userId)
        )
        .unique();
};

export const create = mutation({
    args: {
        body: v.string(),
        image: v.optional(v.id("_storage")),
        workspaceId: v.id("workspaces"),
        channelId: v.optional(v.id("channels")),
        conversationId: v.optional(v.id("conversations")),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const member = await getMember(ctx, args.workspaceId, userId as Id<"users">);

        if (!member) {
            throw new Error("Member not found");
        }

        const draftId = await ctx.db.insert("drafts", {
            body: args.body,
            image: args.image,
            memberId: member._id,
            workspaceId: args.workspaceId,
            channelId: args.channelId,
            conversationId: args.conversationId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return draftId;
    },
});

export const update = mutation({
    args: {
        id: v.id("drafts"),
        body: v.string(),
        image: v.optional(v.id("_storage")),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const draft = await ctx.db.get(args.id);

        if (!draft) {
            throw new Error("Draft not found");
        }

        const member = await getMember(ctx, draft.workspaceId, userId as Id<"users">);

        if (!member || member._id !== draft.memberId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {
            body: args.body,
            image: args.image,
            updatedAt: Date.now(),
        });

        return args.id;
    },
});

export const remove = mutation({
    args: {
        id: v.id("drafts"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const draft = await ctx.db.get(args.id);

        if (!draft) {
            throw new Error("Draft not found");
        }

        const member = await getMember(ctx, draft.workspaceId, userId as Id<"users">);

        if (!member || member._id !== draft.memberId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);

        return args.id;
    },
});

export const get = query({
    args: {
        workspaceId: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const member = await getMember(ctx, args.workspaceId, userId as Id<"users">);

        if (!member) {
            throw new Error("Member not found");
        }

        const drafts = await ctx.db
            .query("drafts")
            .withIndex("by_workspace_id_member_id", (q: any) =>
                q.eq("workspaceId", args.workspaceId).eq("memberId", member._id)
            )
            .order("desc")
            .collect();

        return drafts;
    },
});

export const sendDraft = mutation({
    args: {
        draftId: v.id("drafts"),
        channelId: v.optional(v.id("channels")),
        conversationId: v.optional(v.id("conversations")),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const draft = await ctx.db.get(args.draftId);

        if (!draft) {
            throw new Error("Draft not found");
        }

        const member = await getMember(ctx, draft.workspaceId, userId as Id<"users">);

        if (!member || member._id !== draft.memberId) {
            throw new Error("Unauthorized");
        }

        // Create the message from the draft
        const messageId = await ctx.db.insert("messages", {
            body: draft.body,
            image: draft.image,
            memberId: draft.memberId,
            workspaceId: draft.workspaceId,
            channelId: args.channelId || draft.channelId,
            conversationId: args.conversationId || draft.conversationId,
        });

        // Delete the draft
        await ctx.db.delete(args.draftId);

        return messageId;
    },
});
