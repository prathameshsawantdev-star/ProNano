import { useMutation, useQuery } from "convex/react"
import { api } from "../../../../convex/_generated/api"

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
