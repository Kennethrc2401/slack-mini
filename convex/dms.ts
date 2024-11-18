import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";

// Query to get DMs between two members
export const getDMs = query({
    args: {
        workspaceId: v.id("workspaces"),
        memberId: v.id("members"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .first();

        if (!currentMember) {
            throw new Error("Current member not found.");
        }

        const otherMember = await ctx.db.get(args.memberId);
        if (!otherMember) {
            throw new Error("Member not found.");
        }

        // Fetch all DMs that match the workspace ID and current/other member IDs
        const dms = await ctx.db
            .query("dms")
            .filter((q) =>
                q.and(
                    q.eq(q.field("workspaceId"), args.workspaceId), // Direct comparison with args.workspaceId
                    q.or(
                        q.and(
                            q.eq(q.field("memberOneId"), currentMember._id),
                            q.eq(q.field("memberTwoId"), otherMember._id)
                        ),
                        q.and(
                            q.eq(q.field("memberOneId"), otherMember._id),
                            q.eq(q.field("memberTwoId"), currentMember._id)
                        )
                    )
                )
            )
            .collect();

        return dms;
    },
});


// Mutation to create a new DM between two members
export const createDM = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        memberId: v.id("members"),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .first();

        if (!currentMember) {
            throw new Error("Current member not found.");
        }

        const otherMember = await ctx.db.get(args.memberId);
        if (!otherMember) {
            throw new Error("Other member not found.");
        }

        try {
            const newDMId = await ctx.db.insert("dms", {
                workspaceId: args.workspaceId,
                memberOneId: currentMember._id,
                memberTwoId: args.memberId,
                body: args.body,
                createdAt: Date.now(), // Ensure createdAt is set here
            });

            return newDMId;
        } catch (error) {
            console.error("Error creating DM:", error);
            throw new Error("Failed to create DM.");
        }
    }
});



// Mutation to update an existing DM
export const updateDM = mutation({
    args: {
        dmId: v.id("dms"),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const dm = await ctx.db.get(args.dmId);
        if (!dm) {
            throw new Error("DM not found.");
        }

        // Only allow members of the DM to update it
        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .first();

        if (
            !currentMember ||
            (currentMember._id !== dm.memberOneId && currentMember._id !== dm.memberTwoId)
        ) {
            throw new Error("Permission denied.");
        }

        await ctx.db.patch(args.dmId, {
            body: args.body,
        });

        return { success: true };
    },
});

// Mutation to delete a DM
export const deleteDM = mutation({
    args: {
        dmId: v.id("dms"),
    },
    handler: async (ctx, args) => {
        const userId = await auth.getUserId(ctx);
        if (!userId) {
            throw new Error("Unauthorized");
        }

        const dm = await ctx.db.get(args.dmId);
        if (!dm) {
            throw new Error("DM not found.");
        }

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId))
            .first();

        if (
            !currentMember ||
            (currentMember._id !== dm.memberOneId && currentMember._id !== dm.memberTwoId)
        ) {
            throw new Error("Permission denied.");
        }

        await ctx.db.delete(args.dmId);
        return { success: true };
    },
});