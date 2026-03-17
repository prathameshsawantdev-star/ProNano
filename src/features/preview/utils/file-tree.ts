import { FileSystemTree } from "@webcontainer/api"
import { Doc, Id } from "../../../../convex/_generated/dataModel"
import { getFile } from "../../../../convex/files"
import { Parts } from "openai/resources/uploads/parts.mjs"

type FileDoc = Doc<"files">

export const fileSystemTree = (files: FileDoc[]):FileSystemTree => {
    const fileTree:FileSystemTree = {}
    const filesMap = new Map(files.map((f) => [f._id, f]))

    const getFileParts = (file: FileDoc) => {
        const parts: string[] = [file.name]
        let parentId = file.parentId

        while(parentId){
            const parent = filesMap.get(parentId)
            if(!parent) break;
            parts.unshift(parent.name)
            parentId = parent.parentId
        }

        return parts 
    }

    for (const file of files){
        const pathParts = getFileParts(file);
        let current = fileTree
        
        for(let i = 0; i < pathParts.length; i++){
            const isLast = i === pathParts.length - 1
            const part = pathParts[i];

            if(isLast){
                if(file.type === "folder"){
                    current[part] = { directory: {} }
                } else if(!file.storageId && file.content !== undefined ){
                    current[part] = { file: { contents: file.content }}
                }
            } else {
                if(!current[part]){
                    current[part] = { directory: { }}
                }
                const node = current[part];
                if("directory" in node){
                    current = node.directory;
                }
            }
        }

    }

    return fileTree;
}

export const getFilePath = (file: FileDoc, filesMap: Map<Id<"files">, FileDoc>):string => {
      const parts: string[] = [file.name]
        let parentId = file.parentId

        while(parentId){
            const parent = filesMap.get(parentId)
            if(!parent) break;
            parts.unshift(parent.name)
            parentId = parent.parentId
        }
    
        return parts.join("/")
}

