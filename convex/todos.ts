// todos.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// Query all tasks
export const getTodos = query({
    args: { workspaceId: v.id("workspaces"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = args.userId;
        if (!userId) throw new Error("Unauthorized");

        const todos = await ctx.db
            .query("todos")
            .withIndex("by_workspace_id", (q) => q.eq("workspaceId", args.workspaceId))
            .collect();

        return todos;
    },
});

// Create a task
export const createTodo = mutation({
    args: { workspaceId: v.id("workspaces"), task: v.string(), userId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = args.userId;
        if (!userId) throw new Error("Unauthorized");

        const member = await ctx.db
            .query("members")
            .withIndex("by_user_id", (q) => q.eq("userId", userId as Id<"users">))
            .first();

        if (!member) throw new Error("Member not found");

        await ctx.db.insert("todos", {
            workspaceId: args.workspaceId,
            memberId: member._id,
            task: args.task,
            isComplete: false,
            createdAt: Date.now(),
        });
    },
});

// Mark a task as complete or delete a task
export const updateTodo = mutation({
    args: { todoId: v.id("todos"), isComplete: v.boolean(), userId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = args.userId;
        if (!userId) throw new Error("Unauthorized");
        await ctx.db.patch(args.todoId, { isComplete: args.isComplete });
    },
});

export const deleteTodo = mutation({
    args: { todoId: v.id("todos"), userId: v.id("users") },
    handler: async (ctx, args) => {
        const userId = args.userId;
        if (!userId) throw new Error("Unauthorized");
        await ctx.db.delete(args.todoId);
    },
});
