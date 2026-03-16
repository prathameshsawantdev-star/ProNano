import { convex } from "@/lib/convex-client"
import { createTool } from "@inngest/agent-kit"
import z from "zod"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"
import { parse } from "path"


interface RenameFileToolOptions {
    internalKey: string 
}

const paramsSchema = z.object({
        fileId: z.string(),
        name: z.string()    
})

export const createRenameFileTools = ({ internalKey }:RenameFileToolOptions) => {
    return createTool({
        name: "renameFile",
       description: "rename existing file!",
       parameters: z.object({
        fileId: z.string(),
        content: z.string()
       }), 
       handler:async (params, { step: toolStep }) => {
            try{
                const parsed = paramsSchema.safeParse(params);
                if(!parsed.success){
                    return `Error: ${parsed.error.issues[0].message}`
                }

                const { fileId, name } = parsed.data;

                const file = await convex.query(api.system.getFileById, {
                    internalKey,
                    fileId: fileId as Id<"files">
                })

                if(!file){
                    return `File with ID:${fileId} doesn't exist, try using list-files tool to get valid files and their Ids`
                }

                

                return await toolStep?.run("rename-file", async() => {
                    await convex.mutation(api.system.renameFile, {
                        internalKey,
                        fileId: fileId as Id<"files">,
                        newName: name
                    })
                    return `File  ${file.name} is renamed to ${name} successfully`
                })
            }
            catch (error){
                return `Error reading files ${error instanceof Error ? error.message : "Unknown error"}`
            }
        }
    })
}