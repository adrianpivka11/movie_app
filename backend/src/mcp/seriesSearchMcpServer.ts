import "dotenv/config";
import { createSeriesSearchMcpApp } from "./seriesSearchMcpApp.js";
import { SERIES_SEARCH_TOOL_NAME } from "./sharedTypes.js";

const port = Number(
  process.env.SERIES_SEARCH_MCP_PORT ?? process.env.PORT ?? 3003
);

validateRuntimeEnv();

const app = createSeriesSearchMcpApp();

app.listen(port, () => {
  console.error(
    `Series Search MCP Server running on http://localhost:${port}/mcp`
  );
  console.error(`Tool: ${SERIES_SEARCH_TOOL_NAME}`);
  console.error("Input:  { query: string }");
  console.error("Output: { series: SeriesRecommendation[] }");
});

function validateRuntimeEnv() {
  const requiredEnvVars = [
    "OPENAI_API_KEY",
    "OPENAI_MODEL",
    "OPENAI_MODEL_NON_REASONING",
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
