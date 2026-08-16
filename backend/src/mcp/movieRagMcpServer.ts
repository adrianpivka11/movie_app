import "dotenv/config";
import { MOVIE_RAG_TOOL_NAME } from "./sharedTypes.js";
import { createMovieRagMcpApp } from "./movieRagMcpApp.js";

const port = Number(process.env.MOVIE_RAG_MCP_PORT ?? process.env.PORT ?? 3002);
const app = createMovieRagMcpApp();

app.listen(port, () => {
  console.error(`Movie RAG MCP Server running on http://localhost:${port}/mcp`);
  console.error(`Tool: ${MOVIE_RAG_TOOL_NAME}`);
  console.error("Input:  { query: string }");
  console.error("Output: { movies: MovieRecommendation[] }");
});
