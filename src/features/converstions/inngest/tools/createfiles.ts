import z from "zod";
import { Id } from "../../../../../convex/_generated/dataModel";
import { createTool } from "@inngest/agent-kit";
import { api } from "../../../../../convex/_generated/api";
import { convex } from "@/lib/convex-client";
import { resolve } from "path";
import { create } from "domain";

interface CreateFilesProps { 
    internalKey: string
    projectId: Id<"projects">
}

const paramsSchema = z.object({
    parentId: z.string(),
    files: z.array(
        z.object({
            name: z.string(),
            content: z.string()
        })
    ).min(1, "files should at least contain one file")
})

export const createFilesTool = ({internalKey, projectId}:CreateFilesProps) => {
    return createTool({
        name: "createFiles",
          description:
      "Create multiple files at once in the same folder. Use this to batch create files that share the same parent folder. More efficient than creating files one by one.",
       parameters: z.object({
        parentId: z
        .string()
        .describe(
          "The ID of the parent folder. Use empty string for root level. Must be a valid folder ID from listFiles."
        ),
        files: z
            .array(
            z.object({
                name: z.string().describe("The file name including extension"),
                content: z.string().describe("The file content"),
            })
            )
            .describe("Array of files to create"),
        }),
      handler: async(params, { step: toolStep }) => {
        const parsed = paramsSchema.safeParse(params)

         if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
        }

        const { parentId, files } = parsed.data;

        return await toolStep?.run("create-file", async () => {
            try{
            // make sure parent folder exist
            let resolvedParentId: Id<"files"> | undefined;
            if(parentId && parentId !== ""){
                resolvedParentId = parentId as Id<"files">
                const parentFolder = await convex.query(api.system.getFileById, {
                    internalKey,
                    fileId: resolvedParentId as Id<"files">
                })

                if(!parentFolder || parentFolder.type !== "folder"){
                    return `Error parent folder with Id:${resolvedParentId} not found, or it is not a folder`
                }
            }

            const results = await convex.mutation(api.system.createFiles, {
                parentId: parentId as Id<"files">,
                files, 
                projectId: projectId as Id<"projects">,
                internalKey
            })

            const created = results.filter(r => !r.error);
            const failed = results.filter(r => r.error);

            let response = `created ${created.length} files\n`
            if(created.length > 0){
                response += `${created.map(c => c.name).join(", ")}\n`
            }
            if(failed.length > 0){
                response += `${failed.map(f => f.name).join(", ")}`
            }
            
            return response;
        }catch(error){
            return `Invalid parentId Error:${error}, use listFiles tool to get valid file names.`
        }

        })

      }

    
    })
}