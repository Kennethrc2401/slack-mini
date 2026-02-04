import { auth } from './auth';
import { query, mutation } from "./_generated/server";
import { Id } from './_generated/dataModel';
import { v } from 'convex/values';

// Register or get a user
export const upsert = mutation({
    args: {
        userId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Try to find existing user by email
        const existingUser = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (existingUser) {
            // Update the user if they have a name
            if (args.name) {
                await ctx.db.patch(existingUser._id, { name: args.name });
            }
            return existingUser;
        }

        // Create new user
        const newUserId = await ctx.db.insert("users", {
            email: args.email,
            name: args.name,
            emailVerificationTime: Date.now(),
        });

        const newUser = await ctx.db.get(newUserId);
        if (!newUser) {
            throw new Error("Failed to create user");
        }

        return newUser;
    },
});

export const current = query({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const userId = args.userId;

        if (userId === null) {
            return null;
        }

        return await ctx.db.get(userId);
    },
});

export const updateName = mutation({
    args: {
        userId: v.id("users"),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        
        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(args.userId, {
            name: args.name,
        });

        return await ctx.db.get(args.userId);
    },
});