import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";

const schema = defineSchema({
    ...authTables,
    workspaces: defineTable({
        name: v.string(),
        userId: v.id("users"),
        joinCode: v.string(),
    }),
    members: defineTable({
        userId: v.id("users"),
        workspaceId: v.id("workspaces"),
        role: v.union(v.literal("admin"), v.literal("member")),
    })
        .index("by_user_id", ["userId"])
        .index("by_workspace_id", ["workspaceId"])
        .index("by_workspace_id_user_id", ["workspaceId", "userId"]),
    channels: defineTable({
        name: v.string(),
        workspaceId: v.id("workspaces"),
    })
        .index("by_workspace_id", ["workspaceId"]),
    conversations: defineTable({
        workspaceId: v.id("workspaces"),
        memberOneId: v.id("members"),
        memberTwoId: v.id("members"),
    }).index("by_workspace_id", ["workspaceId"]),
    messages: defineTable({
        body: v.string(),
        image: v.optional(v.id("_storage")),
        memberId: v.id("members"),
        workspaceId: v.id("workspaces"),
        channelId: v.optional(v.id("channels")),
        parentMessageId: v.optional(v.id("messages")),
        conversationId: v.optional(v.id("conversations")),
        dmId: v.optional(v.id("dms")), // New field for DM association
        updatedAt: v.optional(v.number()),
    })
        .index("by_workspace_id", ["workspaceId"])
        .index("by_member_id", ["memberId"])
        .index("by_channel_id", ["channelId"])
        .index("by_conversation_id", ["conversationId"])
        .index("by_dm_id", ["dmId"]) // New index for DM messages
        .index("by_parent_message_id", ["parentMessageId"])
        .index("by_channel_id_parent_message_id_conversation_id", 
            ["channelId", "parentMessageId", "conversationId"]),
    reactions: defineTable({
        workspaceId: v.id("workspaces"),
        messageId: v.id("messages"),
        memberId: v.id("members"),
        value: v.string(),
    })
        .index("by_workspace_id", ["workspaceId"])
        .index("by_message_id", ["messageId"])
        .index("by_member_id", ["memberId"]),
    dms: defineTable({
    workspaceId: v.id("workspaces"),
    memberOneId: v.id("members"),
    memberTwoId: v.id("members"),
    body: v.string(),
    createdAt: v.optional(v.float64()), // Make createdAt optional
})
    .index("by_workspace_id", ["workspaceId"])
    .index("by_member_one_id", ["memberOneId"])
    .index("by_member_two_id", ["memberTwoId"]),
    activity: defineTable({
        workspaceId: v.id("workspaces"),
        conversationId: v.optional(v.id("conversations")),
        messageId: v.id("messages"),
        memberId: v.id("members"),            // The member the activity is for
        initiatorMemberId: v.optional(v.id("members")),  // The member who triggered the action
        actionType: v.union(
            v.literal("reply"), 
            v.literal("mention"), 
            v.literal("new_message")
        ),
        isRead: v.optional(v.boolean()), // Optional, default could be false
        actionDetails: v.optional(v.string()), // Additional context
        createdAt: v.number(),
    })
    .index("by_member_id", ["memberId"])
    .index("by_workspace_id", ["workspaceId"]),

});


export default schema;