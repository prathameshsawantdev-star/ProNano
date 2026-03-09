import { google } from "@ai-sdk/google";
import { inngest } from "./client";
import { generateText } from "ai";
import Firecrawl from "@mendable/firecrawl-js"

const firecrawl = new Firecrawl({ apiKey: process.env.FIRECRAWL_API_KEY });

export const helloWorld = inngest.createFunction(
    { id: "hello-world" },
    { event: "test/hello-world" },
    async ({ event, step }) => {
        await step.sleep("wait-a-minute", "1s");
        return { message: "Hello, world! from Inngest function !"}
    }
)


const URL_REGEX = /https?:\/\/[^\s]+/g;
export const generateTextFn = inngest.createFunction(
    { id: "generate-text" },
    { event: "test/generate-text" },
    async ({ event, step }) => {
        const { prompt } = event.data as { prompt: string };

        const urls = await step.run("extract-urls", async () => {
            const matches = prompt.match(URL_REGEX);
            return matches || [];
        }) as string[];

        const scrapedContent = await step.run("scrape-urls", async () => {
            const results = await Promise.all(
                urls.map(async (url) => {
                    const result = await firecrawl.scrape(url, { formats: ['markdown'] })
                    return result.markdown || "";
                })
            )

            return results.filter().join("\n\n");
        })

        const finalPrompt = scrapedContent ? `Context:\n${scrapedContent}\n\nQuestion:\n${prompt}` : `Question:\n${prompt}`
        return await step.run("generate-text-gemini", async () => {
            return await generateText({
                model: google('gemini-2.5-flash'),
                prompt: finalPrompt,   
            });
        })
    }
)