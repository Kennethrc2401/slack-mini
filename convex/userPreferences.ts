import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

const getMember = async (
    ctx: QueryCtx,
    workspaceId: Id<"workspaces">,
    userId: Id<"users">
) => {
    return ctx.db
        .query("members")
        .withIndex("by_workspace_id_user_id", (q) =>
            q.eq("workspaceId", workspaceId)
            .eq("userId", userId))
            .unique();
}

// Get preferences by member ID
export const getMemberPreferencesById = query({
    args: {
        workspaceId: v.id("workspaces"),
        memberId: v.id("members"),
        theme: v.optional(
            v.union(
                v.literal("light"), 
                v.literal("dark"), 
                v.literal("system"), 
                v.literal("lgbtq"), 
                v.literal("trans"),
                v.literal("lesbian"),
                v.literal("bi"),
                v.literal("gay"),
                v.literal("queer")
            )
        ),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            return null;
        }

        const member = await getMember(ctx, args.workspaceId, userId as Id<"users">);

        if (!member) {
            return null;
        }

        if (member._id !== args.memberId) {
            return null;
        }

        // Get preferences by user ID
        const preferences = await ctx.db
            .query("userPreferences")
            .withIndex("by_member_id", (q) =>
                q.eq("memberId", args.memberId))
            .unique();
        
        return preferences;
    },
});

// Update preferences by member ID
export const updateMemberPreferencesById = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        memberId: v.id("members"),
        userId: v.id("users"),
        theme: v.optional(v.string()),
        notificationsEnabled: v.optional(v.boolean()),
        soundEnabled: v.optional(v.boolean()),
        readReceipts: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const member = await getMember(ctx, args.workspaceId, args.userId);

        if (!member) {
            throw new Error("Unauthorized");
        }

        if (member._id !== args.memberId) {
            throw new Error("Unauthorized");
        }

        // Update preferences by user ID
        const preferences = await ctx.db
            .query("userPreferences")
            .withIndex("by_member_id", (q) =>
                q.eq("memberId", args.memberId))
            .unique();

        if (!preferences) {
            await ctx.db.insert("userPreferences", {
                workspaceId: args.workspaceId,
                memberId: args.memberId,
                theme: (args.theme as "light" | "dark" | "system" | "lgbtq" | "trans" | "lesbian" | "bi" | "gay" | "queer") || "light",
                notificationsEnabled: args.notificationsEnabled ?? true,
                soundEnabled: args.soundEnabled ?? true,
                readReceipts: args.readReceipts ?? true,
            });
        } else {
            const updateData: any = {};
            if (args.theme !== undefined) {
                updateData.theme = args.theme as "light" | "dark" | "system" | "lgbtq" | "trans" | "lesbian" | "bi" | "gay" | "queer";
            }
            if (args.notificationsEnabled !== undefined) {
                updateData.notificationsEnabled = args.notificationsEnabled;
            }
            if (args.soundEnabled !== undefined) {
                updateData.soundEnabled = args.soundEnabled;
            }
            if (args.readReceipts !== undefined) {
                updateData.readReceipts = args.readReceipts;
            }
            
            await ctx.db.patch(preferences._id, updateData);
        }

        return true;
    },
});