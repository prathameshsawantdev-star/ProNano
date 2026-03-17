import { inngest } from "@/inngest/client";
import { Id } from "../../../../convex/_generated/dataModel";
import { NonRetriableError } from "inngest";
import { convex } from "@/lib/convex-client";
import { api } from "../../../../convex/_generated/api";

import { CODING_AGENT_SYSTEM_PROMPT, TITLE_GENERATOR_SYSTEM_PROMPT } from "./constants";
import { DEFAULT_CONVERSATION_TITLE } from "../constants";
import { createAgent, createNetwork, gemini } from "@inngest/agent-kit"
import { createReadFilesTool } from "./tools/readfile";
import { createListFileTool } from "./tools/listfile";
import { createUpdateFileTools } from "./tools/updatefile";
import { createCreateFilesTool } from "./tools/createfiles";
import { createFolderTool } from "./tools/createfolder";
import { createRenameFileTools } from "./tools/renamefile";
import { createDeleteFileTool } from "./tools/deletefiles";
import { createScrapeUrls } from "./tools/scrape-url";
import { createCreateRootFilesTool } from "./tools/createrootfiles";
import { createFolderinRootTool } from "./tools/createfolderinroot";

interface MessageEvent {
    projectId: Id<"projects">,
    conversationId: Id<"conversations">,
    messageId: Id<"messages">,
    message: string 
}

export const processMessage = inngest.createFunction(
    {
        id: "process-message",
        cancelOn: [
                {
                    event: "message/cancel",
                    if: "event.data.messageId==async.data.messageId"
                }
        ],
        onFailure: async({ event, step }) => {
            const { messageId } = event.data.event.data as MessageEvent
            const internalKey = process.env.CONVEX_INTERNAL_KEY
            if(internalKey){
                await step.run("update-message-on-failure", async () => {
                    await convex.mutation(api.system.updateMessage, {
                        internalKey,
                        messageId,
                        content: "My apologies, I encountered error while processing your request, Let me know if you need anything else!"
                    })
                })
            }
        }
    },
    {
        event: "message/sent"
    },
    async({event, step}) => {
        const { 
            projectId,
            conversationId,
            message,
            messageId
        } = event.data as MessageEvent

        const internalKey = process.env.CONVEX_INTERNAL_KEY
        if(!internalKey) {
            throw new NonRetriableError("CONVEX_INTERNAL_KEY is not configured")
        }

        await step.sleep("wait-for-db-sync", "1s");

        const conversation = await step.run("get-conversation", async() => {
            return await convex.query(api.system.getConversationById, {
                internalKey,
                conversationId,
            })
        })

        if(!conversation) {
            throw new NonRetriableError("Conversation not found!")
        }

                
        const recentMessages = await step.run("get-recent-messages", async () => {
            return await convex.query(api.system.getRecentMessages, {
                internalKey,
                conversationId,
                limit: 10 
            })
        })


        let codingAgentSystemPrompt = CODING_AGENT_SYSTEM_PROMPT

        const contextMessages = recentMessages.filter((mes) => mes._id !== messageId && mes.content.trim() !== "" )
        if(contextMessages.length > 0){
            const historyText = contextMessages.map((msg) => {
                return `${msg.role.toUpperCase()}: ${msg.content}`
            }).join("\n\n");

            codingAgentSystemPrompt += `\n\n## Previous Conversation (for context only - do NOT repeat these responses):\n${historyText}\n\n## Current Request:\nRespond ONLY to the user's new message below. Do not repeat or reference your previous responses.`;
        }

            const shouldGenerateTitle =
      conversation.title === DEFAULT_CONVERSATION_TITLE;

        if(shouldGenerateTitle){
            const titleAgent = createAgent({
                name: "Title Generator",
                system: TITLE_GENERATOR_SYSTEM_PROMPT,
                model: gemini({ 
                    model: "gemini-2.5-flash",
                    apiKey: process.env.GEMINI_API_KEY,
                    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
                }),
            });

            const { output } = await titleAgent.run(message, { step })

            const textMessage = output.find(
                (m) => m.type === "text" && m.role === "assistant"
            )

            if(textMessage?.type === "text"){
                const title = typeof textMessage.content === "string" ? 
                                    textMessage.content.trim() :
                                    textMessage.content.map(c => c.text).join("").trim()
                                    
                if(title){
                    await step.run("update-conversation-title", async() => {
                        await convex.mutation(api.system.updateConversationTitle, {
                            internalKey,
                            conversationId,
                            title
                        })
                    })
                }

            }
        }

        // create coding agent with file tools
        const codingAgent = createAgent({
                name: "AI coding Agent",
                system: codingAgentSystemPrompt,
                model: gemini({ 
                    model: "gemini-2.5-flash",
                    apiKey: process.env.GEMINI_API_KEY,
                    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
                }),
                tools: [
                    createReadFilesTool({ internalKey }),
                    createListFileTool({ internalKey, projectId }),
                    createUpdateFileTools({ internalKey }),
                    createFolderTool({ internalKey, projectId }),
                    createRenameFileTools({ internalKey }),
                    createDeleteFileTool({ internalKey }),
                    createScrapeUrls(),
                    createCreateFilesTool({ internalKey, projectId }),
                    createCreateRootFilesTool({ internalKey, projectId }),
                    createFolderinRootTool({ internalKey, projectId })
                ]
            });

        // create agent network
        const network  = createNetwork({
            name: "pronano",
            agents: [codingAgent],
            maxIter: 10,
            router: ({ network }) => {
                const lastResult = network.state.results.at(-1);
                const hasTextResponse = lastResult?.output.some(
                    (m) => m.type === "text" && m.role === "assistant"
                )
                const hasToolCalls = lastResult?.output.some(
                    (m) => m.type === "tool_call"
                )

                if(hasTextResponse && !hasToolCalls){
                    return undefined
                }

                return codingAgent
            }
        })

        const result = await network.run(message);

          // Extract the assistant's text response from the last agent result
        const lastResult = result.state.results.at(-1);
        const textMessage = lastResult?.output.find(
        (m) => m.type === "text" && m.role === "assistant"
        );

        let assistantResponse =
        "I processed your request. Let me know if you need anything else!";

        
            if(textMessage?.type === "text"){
                assistantResponse = typeof textMessage.content === "string" ? 
                                    textMessage.content.trim() :
                                    textMessage.content.map(c => c.text).join("").trim()
                                    
               

            }

        await step.run("update-assistant-message", async() => {
            await convex.mutation(api.system.updateMessage, {
                internalKey,
                messageId,
                content: assistantResponse
            })
        })

        return { success: true, messageId, conversationId }
    }
)