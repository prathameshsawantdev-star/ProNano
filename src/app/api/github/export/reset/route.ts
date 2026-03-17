
import { convex } from "@/lib/convex-client";
import { auth, clerkClient, createClerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import z from "zod";

import { inngest } from "@/inngest/client";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { api } from "../../../../../../convex/_generated/api";


const requestSchema = z.object({
    projectId: z.string()
})


export async function POST (req: Response){
     const { userId  } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = req.json()
  const { projectId } = requestSchema.parse(body)
  const internalKey = process.env.CONVEX_INTERNAL_KEY;

  if (!internalKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }


  await convex.mutation(api.system.updateExportStatus, {
    projectId: projectId as Id<"projects">,
    newStatus: undefined,
    repoUrl: undefined,
    internalKey
  })
  
  return NextResponse.json({
    success: true,
    projectId: projectId,
  })
}