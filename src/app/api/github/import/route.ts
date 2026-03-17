
import { convex } from "@/lib/convex-client";
import { auth, clerkClient, createClerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import z from "zod";
import { api } from "../../../../../convex/_generated/api";
import { inngest } from "@/inngest/client";
import { Id } from "../../../../../convex/_generated/dataModel";

const requestSchema = z.object({
    url: z.string()
})

function parseGitHubUrl(url: string) {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL");
  }

  return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
}


export async function POST (req: Response){
     const { userId, has } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = req.json()
  const { url } = requestSchema.parse(body)

  const { owner, repo } = parseGitHubUrl(url)

  const client = await clerkClient();
  const tokens = await client.users.getUserOauthAccessToken(userId, "github")

  const githubToken = tokens.data[0].token

  if(!githubToken){
    return NextResponse.json({
        error: `github token not found please connect your github account to ProNano`,
  }, { status: 400 })
  }

  const internalKey = process.env.CONVEX_INTERNAL_KEY;

  if (!internalKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const projectId = await convex.mutation(api.system.createProject, {
    name: repo,
    ownerId: userId,
    internalKey
  })

  const event = await inngest.send({
    name: "github/import.repo",
    data: {
        owner,
        repo,
        projectId: projectId as Id<"projects">,
        githubToken
    }
  })

  return NextResponse.json({
    success: true,
    eventId: event.ids[0]
  })
}