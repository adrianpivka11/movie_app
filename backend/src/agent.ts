import { movieChoiceAgentSystemPrompt } from "./systemPromptAgent.js"
import { getEnv } from "./rag.js"
import { retrieveSimilarMoviesByRAG } from "./rag.js"
import { webSearchTool } from "./seriesWebSearch.js"
import { openai } from "@ai-sdk/openai";
import { generateText, stepCountIs, tool } from "ai"
import { z } from "zod";



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




export async function movieChoiceAgent(query: string) {
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




    console.log('[ToolBased] VÝSLEDKY.');

    
    // --- Extract results ---
    let sources = null;
    let toolUsed = null;

    const toolName = 'movieRagTool';
    const tool2Name = 'webSearchTool';
    
    // I have results in steps - find in which step was 'movieRagTool' used. And retrieve its data

    // let answer
    // for (const [i, step] of result.steps.entries()) {
    //   const toolResult = step.content.find(
    //     (c) => c.type === 'tool-result' && c.toolName === toolName
    //   );

    //   if (toolResult && toolResult.type === 'tool-result') {
    //     console.log(`Tool "${toolName}" použitý v kroku ${i}`);
    //     console.log('Dáta:', toolResult.output);
    //     answer = toolResult.output
    //   }
    // }

    // 2nd variant 

  
  let toolResult: Extract<typeof result.steps[number]['content'][number], { type: 'tool-result' }> | undefined;
  let tool2Result: typeof toolResult;

  for (const [i, step] of result.steps.entries()) {
    const found = step.content.find(
      (c) => c.type === 'tool-result' && c.toolName === toolName
    );
    const found2 = step.content.find(
      (c) => c.type === 'tool-result' && c.toolName === tool2Name
    );

    if (found && found.type === 'tool-result') {
      toolResult = found;
      console.log(`Tool "${toolName}" použitý v kroku ${i}`);
    }
    if (found2 && found2.type === 'tool-result') {
      tool2Result = found2;
      console.log(`Tool "${tool2Name}" použitý v kroku ${i}`);
    }
  }

  const answer = {
    movies: toolResult?.output ?? [],
    series: tool2Result?.output ?? [],
  };

console.log('Dáta:', answer);

    return answer

} 

catch (error) {
    console.error('[ToolBased] Error in RAG process:', error);
    const errorAnswer =
      'I encountered an error while processing your request using tool calling. Please try again later.';
    return { answer: errorAnswer, sources: null, toolUsed: null };
  }}