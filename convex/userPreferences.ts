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

        const member = await getMember(ctx, args.workspaceId, userId);

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
        theme: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const member = await getMember(ctx, args.workspaceId, userId);

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
            });
        } else {
            await ctx.db.patch(
                preferences._id,
                {
                    theme: (
                        args.theme as "light" | "dark" | "system" | "lgbtq" | "lesbian" | "bi" | "gay" | "queer"
                    ) || "light",
                },
                        
            );
        }

        return true;
    },
});