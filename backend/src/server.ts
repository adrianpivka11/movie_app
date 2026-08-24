import "dotenv/config";
import app from "./app.js";

const port = Number(process.env.PORT ?? 3001);

validateRuntimeEnv();

app.listen(port, () => {
  console.log(`Movie app backend listening on http://localhost:${port}`);
});

function validateRuntimeEnv() {
  const requiredEnvVars = [
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

  return [
    "MOVIE_RAG_MCP_URL",
    "SERIES_SEARCH_MCP_URL",
    "MCP_API_KEY",
  ];
}

function isDeploymentRuntime() {
  return process.env.NODE_ENV === "production" || process.env.RENDER === "true";
}
