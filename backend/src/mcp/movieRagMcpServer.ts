import "dotenv/config";
import { MOVIE_RAG_TOOL_NAME } from "./sharedTypes.js";
import { createMovieRagMcpApp } from "./movieRagMcpApp.js";

const port = Number(process.env.MOVIE_RAG_MCP_PORT ?? process.env.PORT ?? 3002);

validateRuntimeEnv();

const app = createMovieRagMcpApp();

app.listen(port, () => {
  console.error(`Movie RAG MCP Server running on http://localhost:${port}/mcp`);
  console.error(`Tool: ${MOVIE_RAG_TOOL_NAME}`);
  console.error("Input:  { query: string }");
  console.error("Output: { movies: MovieRecommendation[] }");
});

function validateRuntimeEnv() {
  const requiredEnvVars = [
    "OPENAI_API_KEY",
    "SUPABASE_URL",
    "SUPABASE_API_KEY",
    "EMBEDDING_MODEL",
    ...getDeploymentOnlyEnvVars(),
  ];

  const missingEnvVars = requiredEnvVars.filter((name) => !process.env[name]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(", ")}.`
    );
  }
}

function getDeploymentOnlyEnvVars() {
  if (!isDeploymentRuntime()) {
    return [];
  }

  return ["MCP_API_KEY"];
}

function isDeploymentRuntime() {
  return process.env.NODE_ENV === "production" || process.env.RENDER === "true";
}
