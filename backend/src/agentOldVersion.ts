import { movieChoiceAgentSystemPrompt } from "./systemPromptAgent.js"
import { getEnv } from "./env.js"
import { retrieveSimilarMoviesByRAG } from "./rag.js"
import { webSearchTool } from "./seriesWebSearch.js"
import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs, tool } from "ai"
import { z } from "zod";
import type { AgentOutput, MovieRecommendation, SeriesRecommendation } from "./types.js"


const MAX_TOOL_STEPS = 3
const TOOL_CALLING_MODEL = getEnv("TOOL_CALLING_MODEL")



// const movieChoiceOutputSchema = z.object({
//   movies: z
//     .array(moviesSchema)
//     .max(5)
//     .describe(
//       "Movies returned by movieRagTool. Return an empty array if the movie tool was not used or found no results.",
//     ),

//   series: z
//     .array(seriesSchema)
//     .max(5)
//     .describe(
//       "Series created only from the findings of web_search. Return an empty array if web search was not used or found no suitable results.",
//     ),

//   toolsUsed: z
//     .array(z.enum(["movieRagTool", "web_search"]))
//     .max(2)
//     .describe(
//       "Names of tools that were actually called. Do not include duplicates.",
//     ),
// });




export async function movieChoiceAgentOldVersion(query: string): Promise<AgentOutput> {
  console.log(`[ToolBased] Received question: ${query}`);


      // Define the tools available to the model
  const tools = {
    // 1.
    // Knowledge base tool on similarity search Supabase Movie Database - RAG
    movieRagTool: tool({
      description: `
        Search the Supabase vector database for movie recommendations.
        Use this tool only when the user asks for movies.
        The database contains movies, not TV series.
      `,
        inputSchema: z.object({
            query: z
            .string()
            .describe(
                "A semantic search query containing the user's movie preferences.",
            ),
        }),

        execute: async ({ query }) => {
          const result = await retrieveSimilarMoviesByRAG(query);
          // console.log(`[ToolBased] data retrieved by movieRagTool:`)
          // console.log(result)
          return result;
        },
        }),

    // 2. 
    // OpenAI's built-in web search tool, to search if user asked for series recommendation
    webSearchTool: tool({
      description: `
        Web search tool to search series for recommendations on IMBd (movies and series database). 
        Use this tool only when user asks for series.
        Use this tool only to search for series.`,
      
      inputSchema: z.object({
            query: z
            .string()
            .describe(
                "User's request that will contain description of series preferences",
            ),
        }),

      execute: async ({ query }) => {
          const result = await webSearchTool(query);
          // console.log(`[ToolBased] data retrieved by movieRagTool:`)
          // console.log(result)
          return result;
        },

    }),
  };

  try {
    // Single call to generateText, letting the LLM decide on tool use
    const result = await generateText({
      model: openai.responses(TOOL_CALLING_MODEL),
      tools: tools,
      stopWhen: stepCountIs(MAX_TOOL_STEPS),
      // System prompt guides the LLM on its role and when to use toolsC
      system: movieChoiceAgentSystemPrompt,
      prompt: query,
    });




    console.log('[ToolBased] VYSLEDKY.');

    
    // --- Extract results ---
    const tool1Name = 'movieRagTool';
    const tool2Name = 'webSearchTool';
    
    
  let movieResults: MovieRecommendation[] = [];
  let seriesResults: SeriesRecommendation[] = [];

  // I have results of tool calls in steps. Find in which step was 'movieRagTool' used. And retrieve its data.
  for (const [i, step] of result.steps.entries()) {
    const found = step.content.find(
      (c) => c.type === 'tool-result' && c.toolName === tool1Name
    );
    const found2 = step.content.find(
      (c) => c.type === 'tool-result' && c.toolName === tool2Name
    );

    if (found && found.type === 'tool-result') {
      movieResults = found.output as MovieRecommendation[];
      console.log(`Tool "${tool1Name}" used in step ${i}`);
    }
    if (found2 && found2.type === 'tool-result') {
      seriesResults = found2.output as SeriesRecommendation[];
      console.log(`Tool "${tool2Name}" used in step ${i}`);
    }
  }

  const answer: AgentOutput = {
    movies: movieResults,
    series: seriesResults,
  };

console.log('Data:', answer);

    return answer

} 

catch (error) {
    console.error('[Agent movieChoiceAgentOldVersion] Recommendation flow failed:', error);
    throw error;
  }}
