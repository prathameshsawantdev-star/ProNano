import { convex } from "@/lib/convex-client"
import { createTool } from "@inngest/agent-kit"
import z from "zod"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"

interface ReadFilesToolsOptions {
    internalKey: string 
}

const paramsSchema = z.object({
    fileIds: z.array(z.string().min(1, "File ids can't be empty")),
})

export const createReadFilesTool = ({internalKey}:ReadFilesToolsOptions) => {
    return createTool({
        name: "readFiles",
        description: "Read the contents of the file from the project, Return the file contents",
        parameters: paramsSchema,
        handler:async (params, { step: toolStep }) => {
            const parsed = paramsSchema.safeParse(params);
            if(parsed.error){
                return `Error: ${parsed.error.issues[0].message}`
            }
            const { fileIds } = parsed.data;
            
            try{
                return await toolStep?.run("read-files", async() => {
                    const results:{id: string, name: string, content: string}[] = []
                for(const fileId of fileIds){
                    const file = await convex.query(api.system.getFileById, {
                        internalKey,
                        fileId: fileId as Id<"files">
                    })

                    if(file && file.content){
                        results.push({
                            id: fileId,
                            name: file.name,
                            content: file.content
                        })
                    }
                }
                if(results.length === 0){
                    return 'Error: no files found with provided Ids, use listFiles tool to get valid fileIds'
                }

                return JSON.stringify(results)
                })
            }
            catch (error){
                return `Error reading files ${error instanceof Error ? error.message : "Unknown error"}`
            }
        }
    })
}