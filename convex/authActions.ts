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
    try {
      // Validate inputs
      if (!args.email || !args.password || !args.name) {
        throw new Error("Missing required fields");
      }

      // Check if user already exists
      const allUsers = await ctx.db.query("users").collect();
      const existingUser = allUsers.find(u => u.email === args.email);

      if (existingUser) {
        throw new Error("User already exists");
      }

      // Create a new user with only required fields
      const userData: any = {
        email: args.email,
        name: args.name,
      };
      
      const userId = await ctx.db.insert("users", userData);

      return { userId, email: args.email, name: args.name };
    } catch (error) {
      console.error("Sign up error:", error);
      throw new Error(error instanceof Error ? error.message : "Sign up failed");
    }
  },
});

// Simple sign-in mutation  
export const signInWithPassword = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // Find user by email - scan all users
      const allUsers = await ctx.db.query("users").collect();
      const user = allUsers.find(u => u.email === args.email);

      if (!user) {
        throw new Error("User not found");
      }

      return { 
        userId: user._id, 
        email: user.email, 
        name: user.name 
      };
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  },
});

// Query to get current user by email (for client-side verification)
export const getCurrentUser = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const allUsers = await ctx.db.query("users").collect();
      const user = allUsers.find(u => u.email === args.email);
      return user || null;
    } catch (error) {
      console.error("Get current user error:", error);
      return null;
    }
  },
});
