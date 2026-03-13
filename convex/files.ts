import { convexToJson, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { verifyAuth } from "./auth";
import { DayButton } from "react-day-picker";
import { Id } from "./_generated/dataModel";

export const getProjectFiles = query({
    args: {
        projectId: v.id("projects")
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId)

        if(!project) {
            throw new Error("Project doesn't exist")
        }

        if (project.ownerId !== identity.subject){
            throw new Error("You are not authorized to access this project")
        }
       return await ctx.db.query("files")
                .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
                .collect()
    }
})

export const getFile = query({
    args: {
        fileId: v.id("files")
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.fileId);

        if (!file){
            throw new Error("file doesn't exist")
        }

        const project = await ctx.db.get("projects", file.projectId)

        if(!project) {
            throw new Error("Project doesn't exist")
        }

        if (project.ownerId !== identity.subject){
            throw new Error("You are not authorized to access this project")
        }
       return file;
    }
})

export const getFolderFiles = query({
    args: {
        projectId: v.id("projects"),
        parentId: v.optional(v.id("files"))
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId)

        if(!project) {
            throw new Error("Project doesn't exist")
        }

        if (project.ownerId !== identity.subject){
            throw new Error("You are not authorized to access this project")
        }
        const files = await ctx.db.query("files")
                .withIndex("by_project_parent", (q) => q.eq("projectId", args.projectId).eq("parentId", args.parentId))
                .collect()

        return files.sort((a, b) => {
            if(a.type === "folder" && b.type === "file") return -1;
            if(a.type === "file" && b.type === "folder") return 1;

            return a.name.localeCompare(b.name);
        })
    }
})

export const createFile = mutation({
    args: {
        projectId: v.id("projects"),
        parentId: v.optional(v.id("files")),
        name: v.string(),
        content: v.string()
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId)

        if(!project) {
            throw new Error("Project doesn't exist")
        }

        if (project.ownerId !== identity.subject){
            throw new Error("You are not authorized to access this project")
        }
        const files = await ctx.db.query("files")
                .withIndex("by_project_parent", (q) => q.eq("projectId", args.projectId).eq("parentId", args.parentId))
                .collect()

        const existingFile = files.find((f => f.type === "file" && f.name === args.name))

        if (!existingFile){
            throw new Error("File already exist")
        }

        const now = Date.now()

        await ctx.db.insert("files", {
            projectId: args.projectId,
            name: args.name,
            content: args.content,
            type: "file",
            parentId: args.parentId,
            updatedAt: Date.now()
        })

        await ctx.db.patch("projects", args.projectId, {
            updatedAt: now
        })
    }
})

export const createFolder = mutation({
    args: {
        projectId: v.id("projects"),
        parentId: v.optional(v.id("files")),
        name: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await verifyAuth(ctx);

        const project = await ctx.db.get("projects", args.projectId)

        if(!project) {
            throw new Error("Project doesn't exist")
        }

        if (project.ownerId !== identity.subject){
            throw new Error("You are not authorized to access this project")
        }
        const files = await ctx.db.query("files")
                .withIndex("by_project_parent", (q) => q.eq("projectId", args.projectId).eq("parentId", args.parentId))
                .collect()

        const existing = files.find((f => f.type === "folder" && f.name === args.name))

        if (!existing){
            throw new Error("File already exist")
        }

        const now = Date.now()

        await ctx.db.insert("files", {
            projectId: args.projectId,
            name: args.name,
            type: "folder",
            parentId: args.parentId,
            updatedAt: now
        })

        await ctx.db.patch("projects", args.projectId, {
            updatedAt: now
        })
    }
})

export const renameFile = mutation({
    args: {
        id: v.id("files"),
        newName: v.string()
    },
    handler: async(ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id)

        if (!file) throw new Error("file doesn't exist")


        const project = await ctx.db.get("projects", file.projectId)

        if(!project) {
            throw new Error("Project doesn't exist")
        }

        if (project.ownerId !== identity.subject){
            throw new Error("You are not authorized to access this project")
        }

        const sibling = await ctx.db.query("files")
                .withIndex("by_project_parent", (q) => q.eq("projectId", file.projectId).eq("parentId", file.parentId))
                .collect()

        const existing = sibling.find(
            s =>
                s.name === args.newName &&
                s.parentId === file.parentId &&
                s._id !== args.id
        )

        if (existing) {
            throw new Error(`The ${existing.type} with the name ${existing.name} Already Exists!`);
        }

        const now = Date.now()

        await ctx.db.patch("files", args.id, {
            name: args.newName,
            updatedAt: now
        })

        await ctx.db.patch("projects", file.projectId, {
            updatedAt: now
        })
        
    }
})



export const deleteFile = mutation({
    args: {
        id: v.id("files"),
    },
    handler: async(ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id)

        if (!file) throw new Error("file doesn't exist")


        const project = await ctx.db.get("projects", file.projectId)

        if(!project) {
            throw new Error("Project doesn't exist")
        }

        if (project.ownerId !== identity.subject){
            throw new Error("You are not authorized to access this project")
        }

       const deleteRecursive = async(fileId: Id<"files">) => {
        const item = await ctx.db.get("files", fileId)

        if(!item) {
            return;
        }

        if(item.type === "folder"){
            const children = await ctx.db.query("files")
                                .withIndex("by_project_parent", q => q.eq("projectId", item.projectId).eq("parentId", item._id))
                                .collect();

            for(const child of children){
                await deleteRecursive(child._id)
            }
        }

        if(item.storageId){
            await ctx.storage.delete(item.storageId)
        }

        await ctx.db.delete("files", fileId)
       }
        
       await deleteRecursive(args.id);

       await ctx.db.patch("projects", file.projectId, {
            updatedAt: Date.now()
        })
    }})

export const updateFile = mutation({
    args: {
        id: v.id("files"),
        content: v.string()
    },
    handler: async(ctx, args) => {
        const identity = await verifyAuth(ctx);

        const file = await ctx.db.get("files", args.id)

        if (!file) throw new Error("file doesn't exist")


        const project = await ctx.db.get("projects", file.projectId)

        if(!project) {
            throw new Error("Project doesn't exist")
        }

        if (project.ownerId !== identity.subject){
            throw new Error("You are not authorized to access this project")
        }

        const now = Date.now()

        await ctx.db.patch("files", args.id, {
            content: args.content,
            updatedAt: now
        })

        await ctx.db.patch("projects", file.projectId, {
            updatedAt: now
        })
    }
})