import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Query to get all DM conversations for the current user
export const getConversations = query({
    args: {
        workspaceId: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId as Id<"users">),)
            .first();

        if (!currentMember) {
            throw new Error("Current member not found.");
        }

        // Get all DMs where the current member is involved
        const conversations = await ctx.db
            .query("dms")
            .filter((q) =>
                q.and(
                    q.eq(q.field("workspaceId"), args.workspaceId),
                    q.or(
                        q.eq(q.field("memberOneId"), currentMember._id),
                        q.eq(q.field("memberTwoId"), currentMember._id)
                    )
                )
            )
            .collect();

        // Group by conversation partner and get the latest message
        const conversationMap = new Map<string, { latestMessage: any; messages: any[] }>();

        for (const dm of conversations) {
            const partnerId = dm.memberOneId === currentMember._id ? dm.memberTwoId : dm.memberOneId;
            const partnerIdString = partnerId.toString();

            if (!conversationMap.has(partnerIdString)) {
                conversationMap.set(partnerIdString, { latestMessage: dm, messages: [dm] });
            } else {
                const conversation = conversationMap.get(partnerIdString)!;
                conversation.messages.push(dm);
                // Update latest message if this one is newer
                if ((dm.createdAt || 0) > (conversation.latestMessage.createdAt || 0)) {
                    conversation.latestMessage = dm;
                }
            }
        }

        // Convert to array and enrich with member info
        const enrichedConversations = [];
        for (const [partnerId, { latestMessage, messages }] of conversationMap.entries()) {
            const partnerMember = await ctx.db.get(partnerId as Id<"members">);
            if (partnerMember && "userId" in partnerMember) {
                const partnerUser = await ctx.db.get(partnerMember.userId as Id<"users">);
                enrichedConversations.push({
                    memberId: partnerId,
                    member: partnerMember,
                    user: partnerUser,
                    latestMessage,
                    messageCount: messages.length,
                });
            }
        }

        // Sort by latest message
        enrichedConversations.sort((a, b) => {
            const aTime = a.latestMessage.createdAt || 0;
            const bTime = b.latestMessage.createdAt || 0;
            return bTime - aTime;
        });

        return enrichedConversations;
    },
});

// Query to get DM messages between two members
export const getMessages = query({
    args: {
        workspaceId: v.id("workspaces"),
        memberId: v.id("members"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId as Id<"users">),)
            .first();

        if (!currentMember) {
            throw new Error("Current member not found.");
        }

        const otherMember = await ctx.db.get(args.memberId);
        if (!otherMember) {
            throw new Error("Member not found.");
        }

        // Fetch all DMs that match the workspace ID and current/other member IDs
        const messages = await ctx.db
            .query("dms")
            .filter((q) =>
                q.and(
                    q.eq(q.field("workspaceId"), args.workspaceId),
                    q.or(
                        q.and(
                            q.eq(q.field("memberOneId"), currentMember._id),
                            q.eq(q.field("memberTwoId"), args.memberId)
                        ),
                        q.and(
                            q.eq(q.field("memberOneId"), args.memberId),
                            q.eq(q.field("memberTwoId"), currentMember._id)
                        )
                    )
                )
            )
            .order("asc")
            .collect();

        // Enrich with sender info
        const enrichedMessages = [];
        for (const msg of messages) {
            const sender = await ctx.db.get(msg.memberOneId);
            const senderUser = sender ? await ctx.db.get(sender.userId) : null;
            enrichedMessages.push({
                ...msg,
                sender,
                senderUser,
            });
        }

        return enrichedMessages;
    },
});

// Mutation to create a new DM between two members
export const createDM = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        memberId: v.id("members"),
        body: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId as Id<"users">))
            .first();

        if (!currentMember) {
            throw new Error("Current member not found.");
        }

        const otherMember = await ctx.db.get(args.memberId);
        if (!otherMember) {
            throw new Error("Other member not found.");
        }

        if (!args.body.trim()) {
            throw new Error("Message cannot be empty");
        }

        try {
            const newDMId = await ctx.db.insert("dms", {
                workspaceId: args.workspaceId,
                memberOneId: currentMember._id,
                memberTwoId: args.memberId,
                body: args.body,
                createdAt: Date.now(),
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
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const dm = await ctx.db.get(args.dmId);
        if (!dm) {
            throw new Error("DM not found.");
        }

        // Only allow members of the DM to update it
        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId as Id<"users">),)
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
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const dm = await ctx.db.get(args.dmId);
        if (!dm) {
            throw new Error("DM not found.");
        }

        const currentMember = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId as Id<"users">))
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