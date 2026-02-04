import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple sign-up/register mutation
export const signUpWithPassword = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (existingUser) {
      throw new Error("User already exists");
    }

    // Create a new user
    // Note: In production, you'd hash the password using bcrypt or similar
    const userId = await ctx.db.insert("users", {
      email: args.email,
      name: args.name,
      // Store password plainly for now (NOT SECURE - for demo only)
      // In production, hash this with bcrypt
      image: undefined,
      emailVerificationTime: Date.now(),
    });

    return { userId, email: args.email, name: args.name };
  },
});

// Simple sign-in mutation  
export const signInWithPassword = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // In production, compare hashed passwords
    // For now, just return the user
    return { 
      userId: user._id, 
      email: user.email, 
      name: user.name 
    };
  },
});

// Query to get current user by email (for client-side verification)
export const getCurrentUser = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    return user || null;
  },
});
