import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel";

export const useProjects = () => {
    return useQuery(api.projects.get);
}

export const useProjectsPartial = ({ limit }: { limit?: number }) => {
    return useQuery(api.projects.getPartial, { 
        limit: limit || 5
    })
}

export const useProjectsCreate = () => {
    return useMutation(api.projects.create)
}

export const useProject = ({ projectId }: { projectId: Id<"projects"> }) => {
    return useQuery(api.projects.getById, { id: projectId });
}

export const useRenameProject = ({ projectId }: { projectId: Id<"projects"> }) => {
    return useMutation(api.projects.rename)
}

export const useUpdateIdentity = () => {
    return useMutation(api.projects.updateOwnerToIdentitySubject)
}

export const useUpdateProjectSettings = () => {
  return useMutation(api.projects.updateSettings);
};