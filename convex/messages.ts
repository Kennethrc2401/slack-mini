import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import { paginationOptsValidator } from "convex/server";

const populateThread = async (ctx: QueryCtx, messageId: Id<"messages">) => {
    const messages = await ctx.db
        .query("messages")
        .withIndex("by_parent_message_id", (q) => q.eq("parentMessageId", messageId))
        .collect();

    if (messages.length === 0) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: "",
        };
    }

    const lastMessage = messages[messages.length - 1];
    const lastMessageMember = await populateMember(ctx, lastMessage.memberId);

    if (!lastMessageMember) {
        return {
            count: 0,
            image: undefined,
            timestamp: 0,
            name: "",
        };
    }

    const lastMessageUser = await populateUser(ctx, lastMessageMember.userId);

    return {
        count: messages.length,
        image: lastMessageUser?.image,
        timestamp: lastMessage._creationTime,
        name: lastMessageUser?.name
    };
};

const populateReactions = (ctx: QueryCtx, messageId: Id<"messages">) => {
    return ctx.db
        .query("reactions")
        .withIndex("by_message_id", (q) => q.eq("messageId", messageId))
        .collect();
};

const populateUser = (ctx: QueryCtx, userId: Id<"users">) => {
    return ctx.db.get(userId);
};

const populateMember = (ctx: QueryCtx, memberId: Id<"members">) => {
    return ctx.db.get(memberId);
};

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

export const remove = mutation({
    args: {
        id: v.id("messages"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const message = await ctx.db.get(args.id);

        if (!message) {
            throw new Error("Message not found");
        }

        const member = await getMember(ctx, message.workspaceId, userId as Id<"users">);

        if (!member || member?._id !== message.memberId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.delete(args.id);
        return args.id;
    },
});

export const update = mutation({
    args: {
        id: v.id("messages"),
        body: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const message = await ctx.db.get(args.id);

        if (!message) {
            throw new Error("Message not found");
        }

        const member = await getMember(ctx, message.workspaceId, userId as Id<"users">);

        if (!member || member?._id !== message.memberId) {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, {
            body: args.body,
            updatedAt: Date.now(),
        });

        return args.id;
    },
});

export const getById = query({
    args: {
        id: v.id("messages"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;
        
        const message = await ctx.db.get(args.id);

        if (!message) {
            return null;
        }

        const currentMember = await getMember(ctx, message.workspaceId, userId as Id<"users">);

        if (!currentMember) {
            return null;
        }

        const member = await populateMember(ctx, message.memberId);

        if (!member) {
            return null;
        }

        const user = await populateUser(ctx, member.userId);

        if (!user) {
            return null;
        }

        const reactions = await populateReactions(ctx, message._id);

        const reactionsWithCounts = reactions.map((reaction) => {
            return {
                ...reaction,
                count: reactions.filter((r) => r.value === reaction.value).length,
            };
        });
        
        const dedupedReactions = reactionsWithCounts.reduce(
            (acc, reaction) => {
                const existingReaction = acc.find(
                    (r) => r.value === reaction.value
                );

                if (existingReaction) {
                    existingReaction.memberIds = Array.from(
                        new Set([
                            ...existingReaction.memberIds,
                            reaction.memberId,
                        ])
                    );
                } else {
                    acc.push({
                        ...reaction,
                        memberIds: [reaction.memberId],
                    });
                }

                return acc;
            },
            [] as (Doc<"reactions"> & {
                count: number;
                memberIds: Id<"members">[];
            })[]
        );

        const reactionsWithoutMemberIdProperty = dedupedReactions.map(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            ({ memberId, ...rest }) => rest,
        );

        const files = message.files 
            ? await Promise.all(message.files.map(async (fileId) => {
                const url = await ctx.storage.getUrl(fileId);
                return { id: fileId, url };
            }))
            : undefined;

        return {
            ...message,
            image: message.image
                ? await ctx.storage.getUrl(message.image)
                : undefined,
            files,
            user,
            member,
            reactions: reactionsWithoutMemberIdProperty,
        };
    },
});

export const get = query({
    args: {
        channelId: v.optional(v.id("channels")),
        conversationId: v.optional(v.id("conversations")),
        parentMessageId: v.optional(v.id("messages")),
        paginationOpts: paginationOptsValidator,
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        let _conversationId = args.conversationId;

        if (!args.conversationId && !args.channelId && args.parentMessageId) {
            const parentMessage = await ctx.db.get(args.parentMessageId);

            if (!parentMessage) {
                throw new Error("Parent message not found");
            }

            _conversationId = parentMessage.conversationId;
        }
        
        const results = await ctx.db
            .query("messages")
            .withIndex("by_channel_id_parent_message_id_conversation_id", (q) =>
                q.eq("channelId", args.channelId)
                .eq("parentMessageId", args.parentMessageId)
                .eq("conversationId", _conversationId)
            )
            .order("desc")
            .paginate(args.paginationOpts);

        return {
            ...results,
            page: (
                await Promise.all(results.page.map(async (message) => {
                    const member = await populateMember(ctx, message.memberId);
                    const user = member ? await populateUser(ctx, member.userId) : null;
                
                    if (!member || !user) {
                        return null;
                    }

                    const reactions = await populateReactions(ctx, message._id);
                    const thread = await populateThread(ctx, message._id);
                    const image = message.image 
                            ? await ctx.storage.getUrl(message.image)
                            : undefined;
                    
                    const files = message.files 
                        ? await Promise.all(message.files.map(async (fileId) => {
                            const url = await ctx.storage.getUrl(fileId);
                            return { id: fileId, url };
                        }))
                        : undefined;

                    const reactionsWithCounts = reactions.map((reaction) => {
                        return {
                            ...reaction,
                            count: reactions.filter((r) => r.value === reaction.value).length,
                        };
                    });

                    const dedupedReactions = reactionsWithCounts.reduce(
                        (acc, reaction) => {
                            const existingReaction = acc.find(
                                (r) => r.value === reaction.value
                            );

                            if (existingReaction) {
                                existingReaction.memberIds = Array.from(
                                    new Set([
                                        ...existingReaction.memberIds,
                                        reaction.memberId,
                                    ])
                                );
                            } else {
                                acc.push({
                                    ...reaction,
                                    memberIds: [reaction.memberId],
                                });
                            }

                            return acc;
                        },
                        [] as (Doc<"reactions"> & {
                            count: number;
                            memberIds: Id<"members">[];
                        })[]
                    );

                    const reactionsWithoutMemberIdProperty = dedupedReactions.map(
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        ({ memberId, ...rest }) => rest,
                    );

                    return {
                        ...message,
                        image,
                        files,
                        member,
                        user,
                        reactions: reactionsWithoutMemberIdProperty,
                        threadCount: thread.count,
                        threadImage: thread.image,
                        threadName: thread.name,
                        threadTimestamp: thread.timestamp,
                    };
                })
                )
            ).filter(
                (message): message is NonNullable<typeof message> => message !== null
            ),
        };
    },
});

export const create = mutation({
    args: {
        body: v.string(),
        image: v.optional(v.id("_storage")),
        files: v.optional(v.array(v.id("_storage"))),
        workspaceId: v.id("workspaces"),
        channelId: v.optional(v.id("channels")),
        conversationId: v.optional(v.id("conversations")),
        parentMessageId: v.optional(v.id("messages")),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const member = await getMember(ctx, args.workspaceId, userId as Id<"users">);

        if (!member) {
            throw new Error("Unauthorized");
        }

        let _conversationId = args.conversationId;

        // Only possible if we are replying to a 1:1 conversation
        if (!args.conversationId && !args.channelId && args.parentMessageId) {
            const parentMessage = await ctx.db.get(args.parentMessageId);

            if (!parentMessage) {
                throw new Error("Parent message not found");
            }

            _conversationId = parentMessage.conversationId;
        };

        const messageId = await ctx.db.insert("messages", {
            memberId: member._id,
            body: args.body,
            image: args.image,
            files: args.files,
            channelId: args.channelId,
            conversationId: _conversationId,
            workspaceId: args.workspaceId,
            parentMessageId: args.parentMessageId,
        });

        return messageId;
    },
});

export const getThreads = query({
    args: {
        workspaceId: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        // Get all messages that have replies (are parent messages)
        const allMessages = await ctx.db
            .query("messages")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        // Filter messages that have at least one reply
        const threadParents = await Promise.all(
            allMessages.map(async (message) => {
                const replies = await ctx.db
                    .query("messages")
                    .withIndex("by_parent_message_id", (q) =>
                        q.eq("parentMessageId", message._id)
                    )
                    .collect();

                if (replies.length > 0) {
                    return {
                        message,
                        replyCount: replies.length,
                        lastReply: replies[replies.length - 1],
                    };
                }
                return null;
            })
        );

        // Filter out null values and sort by last reply time
        const threads = threadParents
            .filter((t) => t !== null)
            .sort((a, b) => {
                if (!a || !b) return 0;
                return b.lastReply._creationTime - a.lastReply._creationTime;
            });

        // Populate thread data
        return await Promise.all(
            threads.map(async (thread) => {
                if (!thread) return null;

                const member = await populateMember(ctx, thread.message.memberId);
                const user = member ? await populateUser(ctx, member.userId) : null;
                const image = thread.message.image
                    ? await ctx.storage.getUrl(thread.message.image)
                    : undefined;

                const lastReplyMember = await populateMember(ctx, thread.lastReply.memberId);
                const lastReplyUser = lastReplyMember
                    ? await populateUser(ctx, lastReplyMember.userId)
                    : null;

                return {
                    _id: thread.message._id,
                    _creationTime: thread.message._creationTime,
                    body: thread.message.body,
                    image,
                    user: {
                        _id: user?._id,
                        name: user?.name,
                        image: user?.image,
                    },
                    replyCount: thread.replyCount,
                    lastReply: {
                        timestamp: thread.lastReply._creationTime,
                        user: {
                            name: lastReplyUser?.name,
                            image: lastReplyUser?.image,
                        },
                    },
                    channelId: thread.message.channelId,
                    conversationId: thread.message.conversationId,
                };
            })
        );
    },
});