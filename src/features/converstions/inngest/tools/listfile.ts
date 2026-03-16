import { convex } from "@/lib/convex-client"
import { createTool } from "@inngest/agent-kit"
import z from "zod"
import { api } from "../../../../../convex/_generated/api"
import { Id } from "../../../../../convex/_generated/dataModel"

interface ListFilesToolsOptions {
    internalKey: string,
    projectId: Id<"projects">
}


export const createListFileTool = ({internalKey, projectId}:ListFilesToolsOptions) => {
    return createTool({
        name: "listFiles",
       description: "List all files and folders in the project. Returns names, IDs, types, and parentId for each item. Items with parentId: null are at root level. Use the parentId to understand the folder structure - items with the same parentId are in the same folder.",
       parameters: z.object({}), 
       handler:async (_, { step: toolStep }) => {
            try{
                return await toolStep?.run("list-files", async() => {
                    const files = await convex.query(api.system.getProjectFiles, {
                        internalKey,
                        projectId
                    })

                    // sort folders first then file 
                    const sorted = files.sort((a, b) => {
                        if(a.type === "folder" && b.type === "file") return -1;
                        if(a.type === "file" && b.type === "folder") return 1;

                        return a.name.localeCompare(b.name);
                    })

                    const fileList = sorted.map((f) => {
                        return{
                            id: f._id,
                            name: f.name,
                            type: f.type,
                            parentId: f.parentId
                        }
                    })

                    return JSON.stringify(fileList)
                })
            }
            catch (error){
                return `Error reading files ${error instanceof Error ? error.message : "Unknown error"}`
            }
        }
    })
}