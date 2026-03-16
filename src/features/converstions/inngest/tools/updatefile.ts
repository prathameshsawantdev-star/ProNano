import { convex } from "@/lib/convex-client"
import { createTool } from "@inngest/agent-kit"
import z from "zod"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"
import { parse } from "path"


interface UpdateFileToolOptions {
    internalKey: string 
}

const paramsSchema = z.object({
        fileId: z.string(),
        content: z.string()    
})

export const createUpdateFileTools = ({ internalKey }:UpdateFileToolOptions) => {
    return createTool({
        name: "updateFile",
       description: "update the contents of an existing file!",
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

                const { fileId, content } = parsed.data;

                const file = await convex.query(api.system.getFileById, {
                    internalKey,
                    fileId: fileId as Id<"files">
                })

                if(!file){
                    return `File with ID:${fileId} doesn't exist, try using list-files tool to get valid files and their Ids`
                }

                if(file.type === "folder"){
                    return `File with ID:${fileId} is folder and not file, you can't change the content of folder, you can only change content of files.`
                }


                return await toolStep?.run("update-file", async() => {
                    await convex.mutation(api.system.updateFile, {
                        internalKey,
                        fileId: fileId as Id<"files">,
                        content
                    })
                    return `File with ${file.name} updated successfully`
                })
            }
            catch (error){
                return `Error reading files ${error instanceof Error ? error.message : "Unknown error"}`
            }
        }
    })
}