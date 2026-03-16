import { useMutation, useQuery } from "convex/react";
import { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { APIUserAbortError } from "openai";
import { mutation } from "../../../../convex/_generated/server";

export const useConversation = (conversationId: Id<"conversations"> | null) => {
    return useQuery(api.conversation.getById, conversationId ? { conversationId } : "skip")
}

export const useMessages = (conversationId: Id<"conversations"> | null) => {
    return useQuery(api.conversation.getMessages,
        conversationId ? 
        {conversationId} :
        "skip"
    )
}

export const useConversations = (projectId: Id<"projects"> | null) => {
    return useQuery(api.conversation.getByProject, 
        projectId ? 
        { projectId } :
        "skip"
    )
}

export const useCreateConversation = (projectId: Id<"projects"> | null) => {
    return useMutation(api.conversation.create)
}