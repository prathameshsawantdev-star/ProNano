
import { firecrawl } from "@/lib/firecrawl";
import { useAuth } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import OpenAI from "openai";

const groqClient = new OpenAI({
    apiKey: process.env.,
    baseURL: "https://api.groq.com/openai/v1",
});

const URL_REGEX = /https?:\/\/[^\s)>\]]+/g;

const QUICK_EDIT_PROMPT = `You are a code editing assistant. Edit the selected code based on the user's instruction.

<context>
<selected_code>
{selectedCode}
</selected_code>
<full_code_context>
{fullCode}
</full_code_context>
</context>

{documentation}

<instruction>
{instruction}
</instruction>

<instructions>
Return ONLY the edited version of the selected code.
Maintain the same indentation level as the original.
Do not include any explanations or comments unless requested.
If the instruction is unclear or cannot be applied, return the original code unchanged.
</instructions>`;

export async function POST(req: Request){
    try{
        const { userId }  = await auth()
         if(!userId){
            return NextResponse.json(
                { error: "User is not auhorized"},
                { status: 401 }
            )
        }
        const { selectedCode, fullCode, instruction } = await req.json();
        if(!selectedCode){
            return NextResponse.json(
                { error: "Selected code is required!"},
                { status: 400 }
            )
        }

        if(!fullCode){
            return NextResponse.json(
                { error: "full code is required!"},
                { status: 400 }
            )
        }

        if(!instruction){
            return NextResponse.json(
                { error: "Instruction is required!"},
                { status: 400 }
            )
        }

        let documentationContext = ""
        const urls:string[] = instruction.match(URL_REGEX) || []

        if(urls.length > 0){
            const scrapedResults = await Promise.all(
                urls.map(async(url) => {
                    try{
                        const result = await firecrawl.scrape(url, {
                            formats: ["markdown"]
                        })

                        if (result.markdown){
                            return `<doc url="${url}" >\n${result.markdown}\n</doc>`
                        }

                        return null
                    } catch {
                        return null
                    }
                })
            )
    
            const validResults = scrapedResults.filter(Boolean);

            if(validResults.length > 0){
                documentationContext = `<documentation>\n${validResults.join("\n\n")}\n</documentation>`;
            }
        }

        const prompt = QUICK_EDIT_PROMPT
                        .replace("{fullCode}", fullCode)
                        .replace("{selectedCode}", selectedCode)
                        .replace("{instruction}", instruction)
                        .replace("{documentation}", documentationContext)

        const response = await groqClient.responses.create({
        model: "openai/gpt-oss-20b",
        input: prompt,
        });
        
        if(!response) return NextResponse.json({ error: "no response from AI"})

        return NextResponse.json({ editedCode: response.output_text })
    }catch(error){
        return NextResponse.json({ error: `Failed to generate edit \nerror:${error}`}, {status: 500})
    }
}