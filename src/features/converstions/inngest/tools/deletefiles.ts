import { convex } from "@/lib/convex-client";
import { createTool } from "@inngest/agent-kit";
import z from "zod";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

interface CreateDeleteFileToolProps { 
    internalKey: string 
}

const paramsSchema = z.object({
       fileIds: z
    .array(z.string().min(1, "File ID cannot be empty"))
    .min(1, "Provide at least one file ID"),  
})

export const createDeleteFileTool = ({ internalKey }:CreateDeleteFileToolProps) => {
    return createTool({
        name: "deleteFiles",
       description: "delete existing file!, If deleting a folder, all the file inside will be deleted recursively",
       parameters: z.object({
        fileId: z.string(),
       }), 
       handler:async (params, { step: toolStep }) => {
            try{
                const parsed = paramsSchema.safeParse(params);
                if(!parsed.success){
                    return `Error: ${parsed.error.issues[0].message}`
                }

                const { fileIds } = parsed.data;

                const filesToDelete :{id: Id<"files">, name: string, type: "folder" | "file"}[] = []

                for (const fileId of fileIds){
                    const file = await convex.query(api.system.getFileById, {
                        internalKey,
                        fileId: fileId as Id<"files">
                    })

                    if(!file){
                        return `file with Id:${fileId} not found, use ListFilest to get valid file Ids`
                    }

                    filesToDelete.push({
                        id: fileId as Id<"files">,
                        name: file.name,
                        type: file.type 
                    })
                }

                return await toolStep?.run("delete-file", async() => {
                   const results: string[] = []

                   for(const file of filesToDelete){
                    await convex.mutation(api.system.deleteFile, {
                        fileId: file.id as Id<"files">,
                        internalKey
                    })

                    results.push(`Deleted ${file.type.toUpperCase()} ${file.name} succesfully`)
                   }

                   results.join("`n")
                })
            }
            catch (error){
                return `Error deleting files ${error instanceof Error ? error.message : "Unknown error"}`
            }
        }
    })
}