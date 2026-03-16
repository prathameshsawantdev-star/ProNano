import { success, z } from "zod"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { convex } from "@/lib/convex-client"
import { api } from "../../../../convex/_generated/api"
import { Id } from "../../../../convex/_generated/dataModel"
import { inngest } from "@/inngest/client"


const requestSchema = z.object({
    conversationId: z.string(),
    message: z.string()
})

export async function POST(req: Request){
        const { userId } = await auth()
        if(!userId){
            return NextResponse.json({ error: "Unauthorized"},{status: 401})
        }

        const payload = await req.json()
        const { conversationId, message } = requestSchema.parse(payload)

        if(!conversationId || !message) {
            return NextResponse.json({ error: "Bad input"},{status: 401 })
        }

        const internalKey = process.env.CONVEX_INTERNAL_KEY
        if(!internalKey){
            return NextResponse.json({ error: "Internal key not found"},{ status: 500 })
        }

        const conversation = await convex.query(api.system.getConversationById, {
            conversationId: conversationId as Id<"conversations">,
            internalKey
        })

        if(!conversation){
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
        }

        const projectId = conversation.projectId;

        const processingMessages = await convex.query(api.system.getProcessingMessages, {
                internalKey,
                 projectId: projectId as Id<"projects">
            })
        if(processingMessages.length > 0){
        await Promise.all(
            processingMessages.map( async (p) => {
                await inngest.send({
                    name: "message/cancel",
                    data: {
                        messageId: p._id
                    }
                })

                await convex.mutation(api.system.updateMessageStatus, {
                    internalKey,
                    messageId: p._id as Id<"messages">,
                    status: "cancelled"
                })
            })
        )
        }
        // create user message 
        const userMessageId = await convex.mutation(api.system.createMessage, {
            internalKey: internalKey,
            projectId,
            conversationId: conversationId as Id<"conversations">,
            content: message,
            role: "user"
        })

        const assistantMessageId = await convex.mutation(api.system.createMessage, {
            internalKey: internalKey,
            projectId,
            conversationId: conversationId as Id<"conversations">,
            content: "",
            role: "assistant",
            status: "processing"
        })

        // TODO: add inngest background job for ai prompting and response 
        const event = await inngest.send({
            name: "message/sent",
            data: {
                messageId: assistantMessageId
            }
        })
        
        // inngest background jobs for message
        return NextResponse.json({
            success: true,
            eventId: event.ids[0], // add later functionality
            messageId: assistantMessageId
        })

}