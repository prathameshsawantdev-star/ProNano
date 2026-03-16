import z from "zod";


import { Id } from "../../../../../convex/_generated/dataModel";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../../convex/_generated/api";
import { inngest } from "@/inngest/client";
const requestSchema = z.object({
    projectId: z.string()
})

export async function POST(req: Request){
    const { userId } = await auth();
    if(!userId) return NextResponse.json("Unauthorized", { status: 401 })

    const body = await req.json();
    const { projectId } = requestSchema.parse(body);
    const internalKey = process.env.CONVEX_INTERNAL_KEY
     if(!internalKey){
            return NextResponse.json({ error: "Internal key not found"},{ status: 500 })
        }
    
    const processingMessages = await convex.query(api.system.getProcessingMessages, {
        internalKey,
        projectId: projectId as Id<"projects">
    })

     if(!processingMessages) {
        return NextResponse.json({ success: true, cancelled: false })
     }

     const cancelIds = await Promise.all(
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

            return p._id;
        })
     )

     return NextResponse.json({
        cancelled: true,
        cancelIds,
        success: true 
     })
}