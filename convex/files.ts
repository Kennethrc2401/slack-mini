import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Upload a file
export const uploadFile = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        memberId: v.id("members"),
        storageId: v.id("_storage"),
        name: v.string(),
        fileName: v.string(),
        fileSize: v.number(),
        fileType: v.string(),
    },
    async handler(ctx, args) {
        const fileId = await ctx.db.insert("files", {
            workspaceId: args.workspaceId,
            uploadedByMemberId: args.memberId,
            name: args.name,
            fileName: args.fileName,
            fileSize: args.fileSize,
            fileType: args.fileType,
            storageId: args.storageId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });

        return fileId;
    },
});

// Get all files in a workspace
export const getFiles = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    async handler(ctx, args) {
        const files = await ctx.db
            .query("files")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .order("desc")
            .collect();

        // Fetch member details for each file
        const filesWithMembers = await Promise.all(
            files.map(async (file) => {
                const member = await ctx.db.get(file.uploadedByMemberId);
                const user = member ? await ctx.db.get(member.userId) : null;
                return {
                    ...file,
                    uploadedByMember: member ? { ...member, user } : null,
                };
            })
        );

        return filesWithMembers;
    },
});

// Get a single file
export const getFile = query({
    args: {
        fileId: v.id("files"),
    },
    async handler(ctx, args) {
        const file = await ctx.db.get(args.fileId);
        if (!file) return null;

        const member = await ctx.db.get(file.uploadedByMemberId);
        return {
            ...file,
            uploadedByMember: member,
        };
    },
});

// Delete a file
export const deleteFile = mutation({
    args: {
        fileId: v.id("files"),
    },
    async handler(ctx, args) {
        const file = await ctx.db.get(args.fileId);
        if (!file) throw new Error("File not found");

        // Delete from storage
        await ctx.storage.delete(file.storageId);

        // Delete from database
        await ctx.db.delete(args.fileId);

        return args.fileId;
    },
});

// Update file name
export const renameFile = mutation({
    args: {
        fileId: v.id("files"),
        newName: v.string(),
    },
    async handler(ctx, args) {
        const file = await ctx.db.get(args.fileId);
        if (!file) throw new Error("File not found");

        await ctx.db.patch(args.fileId, {
            name: args.newName,
            updatedAt: Date.now(),
        });

        return args.fileId;
    },
});

// Get download URL for a file
export const getFileUrl = query({
    args: {
        storageId: v.id("_storage"),
    },
    async handler(ctx, args) {
        return await ctx.storage.getUrl(args.storageId);
    },
});
