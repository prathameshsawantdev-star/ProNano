import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"

export const useFile = (fileId: Id<"files"> | null) => {
    return useQuery(api.files.getFile, fileId ? { fileId } : "skip")
}

export const useFilePath = (fileId: Id<"files"> | null) => {
    return useQuery(api.files.getFilePath, fileId ? { fileId } : "skip")
}

export const useUpdateFile = () => {
    return useMutation(api.files.updateFile);
}


export const useCreateFile = () => {
    return useMutation(api.files.createFile)
}

export const useCreateFolder = () => {
    return useMutation(api.files.createFolder)
}

export const useRenameFile = () => {
    return useMutation(api.files.renameFile)
}

export const useDeletefile = () => {
    return useMutation(api.files.deleteFile)
}

export const useFolderContents = ({
    projectId,
    parentId,
    isEnabled
}: {
    projectId: Id<"projects">,
    parentId?: Id<"files">,
    isEnabled: boolean 
}) => {
    return useQuery(
        api.files.getFolderFiles,
        isEnabled ? {projectId, parentId} : "skip"
    )
}