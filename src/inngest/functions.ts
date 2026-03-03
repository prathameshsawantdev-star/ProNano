import { google } from "@ai-sdk/google";
import { inngest } from "./client";
import { generateText } from "ai";

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello-world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-minute", "1s");
        return { message: "Hello, world! from Inngest function !"}
    }
)

export const generateTextFn = inngest.createFunction(
    { id: "generate-text" },
    { event: "test/generate-text" },
    async ({ step }) => {
        return await step.run("generate-text-gemini", async () => {
            return await generateText({
                model: google('gemini-2.5-flash'),
                prompt: `Provide response under 50 words, Prompt: Whats today's date?`,   
            });
        })
    }
)