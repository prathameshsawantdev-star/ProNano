import z from "zod";
import { Id } from "../../../../../convex/_generated/dataModel";
import { createTool } from "@inngest/agent-kit";
import { api } from "../../../../../convex/_generated/api";
import { convex } from "@/lib/convex-client";
import { resolve } from "path";
import { create } from "domain";

interface CreateFolderProps { 
    internalKey: string
    projectId: Id<"projects">
}

const paramsSchema = z.object({
    parentId: z.string(),
    name: z.string(),
    
})

export const createFolderTool = ({internalKey, projectId}:CreateFolderProps) => {
    return createTool({
        name: "create-folder",
          description:
      "Use this tool to create new Folder in root or a folder which id given as parentId",
      
       parameters: z.object({
      name: z.string().describe("The name of the folder to create"),
      parentId: z
        .string()
        .describe(
          "The ID (not name!) of the parent folder from listFiles, or empty string for root level"
        ),
    }),
    handler: async(params, { step: toolStep }) => {
        const parsed = paramsSchema.safeParse(params)

         if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
        }

        const { parentId, name } = parsed.data;

        return await toolStep?.run("create-folder", async() => {
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

            const folderId = await convex.mutation(api.system.createFolder, {
                parentId: parentId as Id<"files">,
                name,
                projectId: projectId as Id<"projects">,
                internalKey
            })

            return `Created folder ${name} with Id:${folderId}`
            
        }catch(error){
            return `Invalid parentId Error:${error}, use listFiles tool to get valid file names.`
        }
        })


      }

    
    })
}