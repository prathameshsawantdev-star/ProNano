import { convexToJson, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./auth";
import { verify } from "crypto";
import { auth } from "@clerk/nextjs/server";

export const create = mutation({
      args: {
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);
        if(!identity) {
            throw new Error("User not Authorized")
        }

        const projectId = await ctx.db.insert("projects", {
            name: args.name,
            ownerId: identity.subject,
            updatedAt: Date.now()
        })
        return projectId;
    }
})

export const get = query({
    args: {},
    handler: async (ctx) => {
        const identity = await verifyAuth(ctx);
       return await ctx.db.query("projects").withIndex("by_owner", (q) => q.eq("ownerId", identity.subject)).order("desc").collect();
    }
})

export const getPartial = query({
    args: {
        limit: v.number()
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);
       return await ctx.db.query("projects").withIndex("by_owner", (q) => q.eq("ownerId", identity.subject)).order("desc").take(args.limit);
    }
})

export const getById = query({
    args: {
        id: v.id("projects")
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.id);

        if(!project) {
            throw new Error("Project not found")
        }

        if(project!.ownerId !== identity.subject) {
            throw new Error("Unauthorized project access!")
        }

        return project;
    }
})

export const rename = mutation({
    args: {
        id: v.id("projects"),
        name: v.string()        
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.id);

        if(!project) {
            throw new Error("Project not found")
        }

        if(project!.ownerId !== identity.subject) {
            throw new Error("Unauthorized project access!")
        }

        await ctx.db.patch("projects", args.id, {
            name: args.name,
            updatedAt: Date.now()
        })
    }
})

const updateSettings = mutation({
    args: {
        projectId: v.id("projects"),
        settings: v.optional(
            v.object({
                installCommand: v.optional(v.string()),
                devCommand: v.optional(v.string())
            })
        )
    },
    handler: async(ctx, args) => {
        const identity = await verifyAuth(ctx)
        if(!identity.subject) {
            throw new Error("Unauthorized")
        }

        const project = await ctx.db.get("projects", args.projectId)
        if(!project){
            throw new Error("Project doesn't exist!")
        }

        if(project.ownerId !== identity.subject){
            throw new Error("You are not authorized to access this project")
        }

        await ctx.db.patch("projects", args.projectId, {
            settings: args.settings,
            updatedAt: Date.now()
        })
    }
})