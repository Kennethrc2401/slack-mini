// events.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Query events by date
export const getEventsByDate = query({
    args: { workspaceId: v.id("workspaces"), date: v.string() },
    handler: async (ctx, args) => {
        const events = await ctx.db
            .query("events")
            .withIndex("by_workspace_id_date", (q) => 
                q.eq("workspaceId", args.workspaceId)
                 .eq("date", args.date))
            .collect();

        return events;
    },
});

// Create a new event
export const createEvent = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        date: v.string(),
        title: v.string(),
        description: v.optional(v.string()),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("events", {
            workspaceId: args.workspaceId,
            date: args.date,
            title: args.title,
            description: args.description,
            createdAt: Date.now(),
        });
    },
});

interface EventUpdates {
    title?: string;
    date?: string;
    description?: string;
}

// Mutation to update an event
export const updateEvent = mutation({
    args: {
        eventId: v.id("events"),
        workspaceId: v.id("workspaces"),
        title: v.optional(v.string()),
        date: v.optional(v.string()), // Assuming date is stored as string in ISO format
        description: v.optional(v.string()),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;
        if (!userId) throw new Error("Unauthorized");

        // Check if the event exists and verify workspace access
        const event = await ctx.db.get(args.eventId);
        if (!event || event.workspaceId !== args.workspaceId) {
            throw new Error("Event not found or access denied.");
        }

        // Construct updates object with type explicitly specified
        const updates: EventUpdates = {
            ...(args.title && { title: args.title }),
            ...(args.date && { date: args.date }),
            ...(args.description && { description: args.description }),
        };

        await ctx.db.patch(args.eventId, updates);
        return { success: true };
    },
});

export const deleteEvent = mutation({
    args: {
        eventId: v.id("events"),
        workspaceId: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;
        if (!userId) throw new Error("Unauthorized");

        // Verify that the event belongs to the workspace
        const event = await ctx.db.get(args.eventId);
        if (!event || event.workspaceId !== args.workspaceId) {
            throw new Error("Event not found or access denied.");
        }

        await ctx.db.delete(args.eventId);
        return { success: true };
    },
});