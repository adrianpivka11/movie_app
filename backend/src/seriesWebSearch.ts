
// Secondary, but neccessary task - TOKENS OPTIMALIZATION. 
// After webSearchTool working normally, I found it consumes from 25k - 50k tokens. Which is huge in comparison with 800 tokens by RAG tool.
// I will use this symbol (@token_optimalization) in my code to highlight steps
// Before optimalization : 25k - 50k tokens per tool call
// After optimalization :  11k - 22k tokens per tool call   55-65% decrease

// Next possible optimalization: In call2 for recommendation, switch model for open source model model: google('gemma-3-27b-it'),  5-10% decrease


import { getEnv } from './env.js'
import { openai } from "@ai-sdk/openai";
import { generateText, Output, stepCountIs } from 'ai';
import { z } from 'zod';
import type { SeriesRecommendation } from './types.js';

const OPENAI_MODEL = getEnv('OPENAI_MODEL');
const OPENAI_MODEL_NON_REASONING = getEnv('OPENAI_MODEL_NON_REASONING');



// structured output schemad definition 
export const seriesSchema = z.object({                // @token_optimalization n.3 I deleted rating - which is not necessary. 
  title: z
    .string()
    .describe("Official title of the TV series."),

  year: z
    .number()
    .int()
    .nullable()
    .describe(
      "The year when the series was first released. Return null if unavailable.",
    ),

                                                      // @token_optimalization n.4 I deleted recommendation from web Search tool - 3-4 sentences x 5 movies = 15-20 sentences.

  // recommendation: z
  //   .string()
  //   .describe(
  //     "A personalized recommendation in 3 to 4 sentences explaining why this series matches the user's request. Do not only summarize the plot.",
  //   ),

});


// sum up schema - function/tool will return array   series: [{},]
export const seriesWebSearchOutputSchema = z.object({
  series: z
    .array(seriesSchema)
    .max(5)
    .describe(
      "Zero to five TV series matching the user's request. Return an empty array when no suitable series were found.",
    ),
});




export async function webSearchTool(query: string): Promise<SeriesRecommendation[]> {
    // query from user
    

    console.log("[Tool based - series search] Call 1: I have received this query:", query)


    // AI SDK LLM call to get structured output
    const result1 = await generateText({
        model: openai.responses(OPENAI_MODEL_NON_REASONING),     // @token_optimalization n.6 - switch GPT-5 on GPT-4 which is non-reasoning (not agentic)
                                                                 // this secures only one call on OPENAI provider. 
        tools: {
            web_search: openai.tools.webSearch({
            searchContextSize: "low",
            filters: { allowedDomains: ["imdb.com"] }    // @token_optimalization n.2  - this limits tool better then system prompt
            })},

        // providerOptions: {
        //   openai: {
        //       reasoningEffort: "low",           // @token_optimalization n.5 Reasoning is on "medium" by default – this should decrease tokens by thousands
        //   }},

        stopWhen: stepCountIs(1),                       // @token_optimalization n.1 - this limits use of openai.tools.websearch on max 1 call
        output: Output.object({                        //  WARNING! OPENAI TOOL CALLS ARE NOT REGULATED! This regulates only AI SDK tool call. In this AI SDK there is openai.tools.webSearch() nested.
            schema: seriesWebSearchOutputSchema,       //  This means that I cannot regulate how many times openai as provider will use webSearch tool! Which can cause big differences in tokens consumption from 8000 up to 20000.
            name: "seriesRecommendations",
            description:
            "TV series recommendations based only on information found through web search.",
        }),

        // prompt and system prompt
        prompt: `
        Find TV series matching this user request:

        ${query}

        Rules:
        - User request may contain request for movies and movie description. However, you should recognize part of user request about series and description of series and look for series only. Do not search for movies.
        - Return at most 5 relevant series.
        - Use web search on https://www.imdb.com/.
        - Do not invent titles, years.
        - Respond in the same language as the user.
        `,
        });

      
    // return structured output - schema
    console.log("[Tool based - series search] LLM result output:")
    console.log(result1.usage)
    console.log(result1.content)

    const webSearchResults = result1.output.series

    // 2nd call to build recommendations for series     // @token_optimalization n.4 

    const recommendationSchema = z.object({
      recommendations: z.array(z.object({
      title: z.string(),
      year: z.number().int().nullable(),
      recommendation: z.string().describe("3 to 4 sentences..."),
    })),
      });
    
    console.log("[Tool based - series search] Call 2: Writting recommendations")

    const result2 = await generateText({
      model: openai.responses(OPENAI_MODEL), 
      output: Output.object({ schema: recommendationSchema, name: "recommendations" }),
      system: `You are an enthusiastic TV series expert. Base your explanation on general 
      knowledge you have about each title, write recommendations for each series. If you are not confident about specific plot 
      details for a title, keep your explanation general (tone, genre, themes) rather 
      than inventing specifics.`,
      prompt: `User request: ${query}\n\nCandidate series: ${JSON.stringify(webSearchResults)}`,
    });

    console.log(result2.usage)
    console.log(result2.output.recommendations)



    return result2.output.recommendations;
}

