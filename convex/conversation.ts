import { mutation, query } from "./_generated/server"
import { convexToJson, v } from "convex/values"
import { verifyAuth } from "./auth";

export const create = mutation(
 {
    args: {
        projectId: v.id("projects"),
        title: v.string()
    },
    handler: async(ctx, args) => {
         const identity = await verifyAuth(ctx);
        
        const project = await ctx.db.get("projects", args.projectId)
        
        if(!project) {
            throw new Error("Project doesn't exist")
        }
        
        if (project.ownerId !== identity.subject){
            throw new Error("You are not authorized to access this project")
        }

        const conversationId = await ctx.db.insert("conversations", {
            projectId: args.projectId,
            title: args.title,
            updatedAt: Date.now()
        })

        return conversationId
    }
 }
)

export const getById = query({
    args:{
        conversationId: v.id("conversations")
    },
    handler: async(ctx, args) => {
        const conversation = await ctx.db.get("conversations", args.conversationId)

        if(!conversation) throw new Error(`Conversation with Id ${args.conversationId} doesn't exist`);

        const project = await ctx.db.get("projects", conversation.projectId);

        if(!project) throw new Error(`Project with ID: ${conversation.projectId} having conversation: ${conversation.title} doesn't exist`);

        const identity = await verifyAuth(ctx)

        if(project.ownerId !== identity.subject){
            throw new Error("User not authorized for this project")
        }

        return conversation 
    }
})

export const getByProject = query({
    args: {
        projectId: v.id('projects')
    },
    handler: async(ctx, args) => {
         const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId)

        if(!project) {
            throw new Error("Project doesn't exist")
        }

        if (project.ownerId !== identity.subject){
            throw new Error("You are not authorized to access this project")
        }

        return await ctx.db.
                        query("conversations").
                        withIndex("by_project", q => q.eq("projectId", args.projectId)).
                        order("desc"). 
                        collect()
    }
})

export const getMessages = query({
    args: {
        conversationId: v.id('conversations')
    },
    handler: async(ctx, args) => {
        const conversation = await ctx.db.get("conversations", args.conversationId)

        if(!conversation) throw new Error(`Conversation with Id ${args.conversationId} doesn't exist`);

        const project = await ctx.db.get("projects", conversation.projectId);

        if(!project) throw new Error(`Project with ID: ${conversation.projectId} having conversation: ${conversation.title} doesn't exist`);

        const identity = await verifyAuth(ctx)

        if(project.ownerId !== identity.subject){
            throw new Error("User not authorized for this project")
        }


        return await ctx.db.
                        query("messages").
                        withIndex("by_conversation", q => q.eq("conversationId", args.conversationId)).
                        order("asc"). 
                        collect()
    }
})

