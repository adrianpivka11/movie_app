
import { getEnv } from './rag.js'
import { openai } from "@ai-sdk/openai";
import { generateText, Output } from 'ai';
import { resourceLimits } from 'worker_threads';
import { z } from 'zod';

const OPENAI_MODEL = getEnv('OPENAI_MODEL');


// structured output schemad definition 
export const seriesSchema = z.object({
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

  rating: z
    .object({
      value: z
        .number()
        .describe("The numerical rating value."),

      maximum_scale: z
        .number()
        .describe("The maximum rating scale, for example 10 or 100."),

      source: z
        .string()
        .describe(
          "The source of the rating, for example IMDb or Rotten Tomatoes.",
        ),
    })
    .nullable()
    .describe(
      "The rating found through web search. Return null if no reliable rating was found.",
    ),

  recommendation: z
    .string()
    .describe(
      "A personalized recommendation in 3 to 4 sentences explaining why this series matches the user's request. Do not only summarize the plot.",
    ),

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




export async function webSearchTool(query: string) {
    // query from user
    

    console.log("[Tool based - series search] I have received this query:", query)


    // AI SDK LLM call to get structured output
    const result = await generateText({
        model: openai.responses(OPENAI_MODEL),

        tools: {
            web_search: openai.tools.webSearch({
            searchContextSize: "low",
            }),
        },

        output: Output.object({
            schema: seriesWebSearchOutputSchema,
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
        - Use web search on https://www.imdb.com/ before producing recommendations.
        - Do not invent titles, years, ratings, or sources.
        - Explain in 3 to 4 sentences why each series matches the request.
        - Return rating as value, scale and source.
        - If a rating cannot be reliably found, return null.
        - Respond in the same language as the user.
        `,
        });


    // return structured output - schema
    console.log("[Tool based - series search] LLM result output:")
    console.log(result)
    console.log(result.output.series)

    return result.output.series;
}

