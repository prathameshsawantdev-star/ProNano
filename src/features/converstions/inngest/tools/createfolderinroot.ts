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
    name: z.string(),
})

export const createFolderinRootTool = ({internalKey, projectId}:CreateFolderProps) => {
    return createTool({
        name: "create-folder-in-root-folder",
          description:
      "Use this tool to create new Folder in root",
      
       parameters: z.object({
      name: z.string().describe("The name of the folder to create"),
    }),
    handler: async(params, { step: toolStep }) => {
        const parsed = paramsSchema.safeParse(params)

         if (!parsed.success) {
        return `Error: ${parsed.error.issues[0].message}`;
        }

        const { name } = parsed.data;

        return await toolStep?.run("create-folder-in-root-folder", async() => {
            try{
            // make sure parent folder exist
           

            const folderId = await convex.mutation(api.system.createFolder, {
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