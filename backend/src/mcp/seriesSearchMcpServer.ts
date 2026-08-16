import "dotenv/config";
import { createSeriesSearchMcpApp } from "./seriesSearchMcpApp.js";
import { SERIES_SEARCH_TOOL_NAME } from "./sharedTypes.js";

const port = Number(
  process.env.SERIES_SEARCH_MCP_PORT ?? process.env.PORT ?? 3003
);
const app = createSeriesSearchMcpApp();

app.listen(port, () => {
  console.error(
    `Series Search MCP Server running on http://localhost:${port}/mcp`
  );
  console.error(`Tool: ${SERIES_SEARCH_TOOL_NAME}`);
  console.error("Input:  { query: string }");
  console.error("Output: { series: SeriesRecommendation[] }");
});
