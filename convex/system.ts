import { convexToJson, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Average_Sans } from "next/font/google";

const validateInternalKey = (key: string) => {
    const internalKey = process.env.CONVEX_INTERNAL_KEY

    if(!internalKey) throw new Error("Internal key not found")

    if (internalKey !== key) throw new Error("key doesn't match internal key")
}

export const getConversationById = query({
    args: {
        conversationId: v.id("conversations"),
        internalKey: v.string()
    },
    handler: async(ctx, args) => {
        validateInternalKey(args.internalKey)
        return await ctx.db.get(args.conversationId)
    }
})

export const createMessage = mutation({
    args: {
        internalKey: v.string(),
         conversationId: v.id("conversations"),
    projectId: v.id("projects"),
    role: v.union(
        v.literal("user"),
        v.literal("assistant")
    ),
    content: v.string(),
    status: v.optional(
        v.union(
        v.literal("completed"),
        v.literal("processing"),
        v.literal("cancelled")
    )
    )
    },
    handler: async(ctx, args) => {
        validateInternalKey(args.internalKey)
        const messageId = await ctx.db.insert("messages", {
            projectId: args.projectId,
            conversationId: args.conversationId,
            content: args.content,
            role: args.role,
            status: args.status
        })

        await ctx.db.patch(args.conversationId, {
            updatedAt: Date.now()
        })

        return messageId
    }
})

export const updateMessage = mutation({
    args: {
        internalKey: v.string(),
        content: v.string(),
        messageId: v.id("messages")
    },
    handler: async(ctx, args) => {
         validateInternalKey(args.internalKey)

         await ctx.db.patch(args.messageId, {
            content: args.content,
            status: "completed" as const 
         })
    }
})