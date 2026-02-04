import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { auth } from "./auth";
import { Id } from "./_generated/dataModel";

const generateCode = () => {
    const code = Array.from(
        { length: 6 },
        () => 
            "0123456789abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 36)]
    ).join("");

    return code;
};

// Join a workspace
export const join = mutation({
    args: {
        joinCode: v.string(),
        workspaceId: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const workspace = await ctx.db.get(args.workspaceId);

        if (!workspace) {
            throw new Error("Workspace not found");
        }

        if (workspace.joinCode !== args.joinCode.toLowerCase()) {
            throw new Error("Invalid join code");
        }

        const existingMember = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.workspaceId)
                .eq("userId", userId as Id<"users">),
            
        ).unique();

        if (existingMember) {
            throw new Error("Already a member of this workspace");
        }

        await ctx.db.insert("members", {
            userId: userId as Id<"users">,
            workspaceId: workspace._id,
            role: "member",
        });

        return workspace._id;
    },
});

// Create a new workspace
export const create = mutation({
    args: {
        name: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        if (!args.userId) {
            throw new Error("Unauthorized");
        }

        // Generate a unique join code (placeholder for now)
        const joinCode = generateCode();

        try {
            // Insert the new workspace into the database
            const workspaceId = await ctx.db.insert("workspaces", {
                name: args.name,
                userId: args.userId as Id<"users">,
                joinCode,
            });

            await ctx.db.insert("members", {
                userId: args.userId as Id<"users">,
                workspaceId,
                role: "admin",
            });

            await ctx.db.insert("channels", {
                name: "general",
                workspaceId,
            });

            return { workspaceId}; // Returning the full workspace object
        } catch (error) {
            console.error("Error creating workspace:", error);
            throw new Error("Failed to create workspace. Please try again later.");
        }
    },
});

// Regenerate the join code for a workspace
export const newJoinCode = mutation({
    args: {
        workspaceId: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.workspaceId)
                .eq("userId", userId as Id<"users">),
            
        ).unique();

        if (!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }

        const joinCode = generateCode();

        await ctx.db.patch(args.workspaceId, { joinCode });

        return args.workspaceId;
    },
});

// Getting information by id
export const getInfoById = query({
    args: {
        id: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.id)
                .eq("userId", userId as Id<"users">),
            
        ).unique();

        if (!member) {
            return null;
        }

        const workspace = await ctx.db.get(args.id);

        if (!workspace) {
            return null;
        }

        return {
            name: workspace?.name,
            isMember: !!member,
        };
    },
});

// Get all workspaces
export const get = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        // Ensure the user is authenticated
        const userId = args.userId;

        const members = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId as Id<"users">))
            .collect();

        const workspaceIds = members.map((member) => member.workspaceId);

        const workspaces = [];

        for (const workspaceId of workspaceIds) {
            const workspace = await ctx.db.get(workspaceId);
            
            if (workspace) {
                workspaces.push(workspace);
            }
        }

        // Fetch all workspaces the authenticated user has access to
        return workspaces;
    },
});

// Query to get workspaces by user email (for demo/development)
export const getByEmail = query({
    args: {
        email: v.string(),
    },
    handler: async (ctx, args) => {
        // Find the user by email
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (!user) {
            return [];
        }

        const members = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", user._id))
            .collect();

        const workspaceIds = members.map((member) => member.workspaceId);

        const workspaces = [];

        for (const workspaceId of workspaceIds) {
            const workspace = await ctx.db.get(workspaceId);
            
            if (workspace) {
                workspaces.push(workspace);
            }
        }

        return workspaces;
    },
});

// Get a workspace by ID
export const getById = query({
    args: {
        id: v.id("workspaces"),
        email: v.optional(v.string()),
        userId: v.optional(v.id("users")),
    },
    handler: async (ctx, args) => {
        const workspace = await ctx.db.get(args.id);
        
        if (!workspace) {
            return null;
        }

        // If userId is provided, check membership
        if (args.userId) {
            const member = await ctx.db
                .query("members")
                .withIndex("by_workspace_id_user_id", (q) =>
                    q.eq("workspaceId", args.id).eq("userId", args.userId!)
                )
                .unique();

            if (!member) {
                return null;
            }

            return workspace;
        }

        // If email is provided, check membership
        if (args.email) {
            const user = await ctx.db
                .query("users")
                .filter((q) => q.eq(q.field("email"), args.email))
                .first();

            if (!user) {
                return null;
            }

            const member = await ctx.db
                .query("members")
                .withIndex("by_workspace_id_user_id", (q) => 
                    q.eq("workspaceId", args.id)
                    .eq("userId", user._id),
                
            ).unique();
            
            // Only return if user is a member
            if (!member) {
                return null;
            }
        }

        return workspace;
    },
});

// Update a workspace
export const update = mutation({
    args: {
        id: v.id("workspaces"),
        name: v.string(),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.id)
                .eq("userId", userId as Id<"users">),
            
        ).unique();

        if (!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }

        await ctx.db.patch(args.id, 
            { name: args.name }
        );

        return args.id;
    },
});

// Delete a workspace
export const remove = mutation({
    args: {
        id: v.id("workspaces"),
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        if (!userId) {
            throw new Error("Unauthorized");
        }

        const member = await ctx.db
            .query("members")
            .withIndex("by_workspace_id_user_id", (q) => 
                q.eq("workspaceId", args.id)
                .eq("userId", userId as Id<"users">),
            
        ).unique();

        if (!member || member.role !== "admin") {
            throw new Error("Unauthorized");
        }

        const [members, channels, conversations, messages, reactions] = await Promise.all([
            ctx.db
                .query("members")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect(),
            ctx.db
                .query("channels")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect(),
            ctx.db
                .query("conversations")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect(),
            ctx.db
                .query("messages")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect(),
            ctx.db
                .query("reactions")
                .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.id))
                .collect(),
        ]);

        for (const member of members) {
            await ctx.db.delete(member._id);
        }

        for (const channel of channels) {
            await ctx.db.delete(channel._id);
        }

        for (const conversation of conversations) {
            await ctx.db.delete(conversation._id);
        }

        for (const message of messages) {
            await ctx.db.delete(message._id);
        }

        for (const reaction of reactions) {
            await ctx.db.delete(reaction._id);
        }
        
        await ctx.db.delete(args.id);

        return args.id;
    },
});