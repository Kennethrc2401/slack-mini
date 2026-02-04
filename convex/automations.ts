import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Get automations for a workspace
export const get = query({
    args: {
        workspaceId: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;

        // Verify member exists in workspace
        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) =>
                q.eq("workspaceId", args.workspaceId).eq("userId", userId),
            )
            .unique();

        if (!member) {
            throw new Error("Unauthorized");
        }

        // Return automations for this workspace
        return await ctx.db
            .query("automations")
            .withIndex("by_workspace_id", (q) =>
                q.eq("workspaceId", args.workspaceId),
            )
            .collect();
    },
});

// Create a new automation
export const create = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        type: v.string(),
        channelId: v.id("channels"),
        time: v.string(), // "HH:mm"
        timezone: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;

        // Verify member exists in workspace
        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) =>
                q.eq("workspaceId", args.workspaceId).eq("userId", userId),
            )
            .unique();

        if (!member) {
            throw new Error("Unauthorized");
        }

        // Verify channel exists in workspace
        const channel = await ctx.db.get(args.channelId);
        if (!channel || channel.workspaceId !== args.workspaceId) {
            throw new Error("Channel not found");
        }

        // Create automation
        const automationId = await ctx.db.insert("automations", {
            workspaceId: args.workspaceId,
            userId,
            type: args.type,
            channelId: args.channelId,
            time: args.time,
            timezone: args.timezone,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return automationId;
    },
});

// Update automation
export const update = mutation({
    args: {
        id: v.id("automations"),
        isActive: v.optional(v.boolean()),
        time: v.optional(v.string()),
        timezone: v.optional(v.string()),
        channelId: v.optional(v.id("channels")),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;
        const automation = await ctx.db.get(args.id);

        if (!automation) {
            throw new Error("Automation not found");
        }

        // Verify ownership
        if (automation.userId !== userId) {
            throw new Error("Unauthorized");
        }

        const updates: {
            isActive?: boolean;
            time?: string;
            timezone?: string;
            channelId?: Id<"channels">;
            updatedAt: number;
        } = {
            updatedAt: Date.now(),
        };

        if (args.isActive !== undefined) updates.isActive = args.isActive;
        if (args.time !== undefined) updates.time = args.time;
        if (args.timezone !== undefined) updates.timezone = args.timezone;
        if (args.channelId !== undefined) updates.channelId = args.channelId;

        await ctx.db.patch(args.id, updates);
        return args.id;
    },
});

// Delete automation
export const remove = mutation({
    args: {
        id: v.id("automations"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId as Id<"users">;
        const automation = await ctx.db.get(args.id);

        if (!automation) {
            throw new Error("Automation not found");
        }

        // Verify ownership
        if (automation.userId !== userId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
        return args.id;
    },
});
