import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Delete channel
export const remove = mutation({
    args: {
        id: v.id("channels"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;

        const channel = await ctx.db.get(args.id);

        if (!channel) {
            throw new Error("Channel not found");
        }


        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", channel.workspaceId)
                .eq("userId", userId),
            
        ).unique();

        if (!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }

        const [messages] = await Promise.all([
            ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) => q.eq("channelId", args.id))
                .collect(),
        ]);

        for (const message of messages) {
            await ctx.db.delete(message._id);
        }

        await ctx.db.delete(args.id);
        
        return args.id;
    },
});

// Update channel name
export const update = mutation({
    args: {
        id: v.id("channels"),
        name: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;

        const channel = await ctx.db.get(args.id);

        if (!channel) {
            throw new Error("Channel not found");
        }


        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", channel.workspaceId)
                .eq("userId", userId),
            
        ).unique();

        if (!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {
            name: args.name,
        });
        
        return args.id;
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        workspaceId: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.workspaceId)
                .eq("userId", userId),
            
        ).unique();

        if (!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }
        
        const parsedName = args.name
            .replace(/\s+/g, "-")
            .toLocaleLowerCase();

            const channelId = await ctx.db.insert("channels", {
                name: parsedName,
                workspaceId: args.workspaceId,
            });

        return channelId;
    },
});

export const getById = query({
    args: {
        id: v.id("channels"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;

        const channel = await ctx.db
            .get(args.id);

        if (!channel) {
            return null;
        }

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", channel.workspaceId)
                .eq("userId", userId),
            
        ).unique();

        if (!member) {
            return null;
        }

        return channel;
    },
});

export const get = query({
    args: {
        workspaceId: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.workspaceId)
                .eq("userId", userId),
            
        ).unique();

        if (!member) {
            return [];
        }

        const channels = await ctx.db
            .query("channels")
            .withIndex("by_workspace_id", (q) => 
                q.eq("workspaceId", args.workspaceId)
            ).collect();

        return channels;
    },
});

export const getWithMeta = query({
    args: {
        workspaceId: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) =>
                q.eq("workspaceId", args.workspaceId)
                .eq("userId", userId),
            )
            .unique();

        if (!member) {
            return [];
        }

        const [channels, members] = await Promise.all([
            ctx.db
                .query("channels")
                .withIndex("by_workspace_id", (q) =>
                    q.eq("workspaceId", args.workspaceId),
                )
                .collect(),
            ctx.db
                .query("members")
                .withIndex("by_workspace_id", (q) =>
                    q.eq("workspaceId", args.workspaceId),
                )
                .collect(),
        ]);

        const memberCount = members.length;

        const results = [] as Array<{
            _id: Id<"channels">;
            _creationTime: number;
            name: string;
            workspaceId: Id<"workspaces">;
            memberCount: number;
            lastMessageAt: number | null;
        }>;

        for (const channel of channels) {
            const lastMessage = await ctx.db
                .query("messages")
                .withIndex("by_channel_id", (q) =>
                    q.eq("channelId", channel._id),
                )
                .order("desc")
                .first();

            results.push({
                ...channel,
                memberCount,
                lastMessageAt: lastMessage?._creationTime ?? null,
            });
        }

        return results;
    },
});