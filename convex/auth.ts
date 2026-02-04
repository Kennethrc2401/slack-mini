import { v } from "convex/values";
import { QueryCtx, MutationCtx } from "./_generated/server";
import { defineTable } from "convex/server";
import { HttpRouter } from "convex/server";

// Simple users table 
export const userTables = {
  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
  }),
};

// Get user ID from Convex identity or return a guest ID
export const auth = {
  async getUserId(ctx: QueryCtx | MutationCtx): Promise<string | null> {
    // Try to get from Convex auth first
    try {
      const identity = await ctx.auth.getUserIdentity();
      if (identity?.tokenIdentifier) {
        return identity.tokenIdentifier;
      }
    } catch (e) {
      // If Convex auth fails, continue to fallback
    }
    
    // Return null - the client should pass the user email if needed
    // The client will handle authentication via the users.upsert mutation
    return null;
  },
  
  addHttpRoutes(http: HttpRouter) {
    return http;
  },
};

// Placeholder exports for compatibility
export const signIn = async () => {};
export const signOut = async () => {};
export const store = {};
export const isAuthenticated = false;

