import cors from "cors";
import express from "express";
import { createRequire } from "node:module";
import { z } from "zod";
import {
  SERIES_SEARCH_TOOL_NAME,
  type SeriesSearchToolInput,
  type SeriesSearchToolResponse,
} from "./sharedTypes.js";
import { requireMcpApiKey } from "./mcpAuth.js";

type SeriesSearchHandler = (
  query: string
) => Promise<SeriesSearchToolResponse>;

type McpServerConstructor = new (config: {
  name: string;
  version: string;
}) => {
  tool: (...args: unknown[]) => void;
  connect: (transport: unknown) => Promise<void>;
};

type StreamableHttpTransportConstructor = new (config: {
  sessionIdGenerator: undefined;
  enableJsonResponse: boolean;
}) => {
  handleRequest: (
    req: express.Request,
    res: express.Response,
    parsedBody?: unknown
  ) => Promise<void>;
};

const require = createRequire(import.meta.url);
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js") as {
  McpServer: McpServerConstructor;
};
const { StreamableHTTPServerTransport } = require(
  "@modelcontextprotocol/sdk/server/streamableHttp.js"
) as {
  StreamableHTTPServerTransport: StreamableHttpTransportConstructor;
};

export function createSeriesSearchMcpApp(
  seriesSearchHandler: SeriesSearchHandler = searchSeriesOnWeb
) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "series-search-mcp" });
  });

  app.post("/mcp", requireMcpApiKey, async (req, res, next) => {
    const server = createSeriesSearchMcpServer(seriesSearchHandler);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      next(error);
    }
  });

  app.use(
    (
      error: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("[Series Search MCP Error]", error);
      res.status(500).json({ error: "Series Search MCP request failed." });
    }
  );

  return app;
}

function createSeriesSearchMcpServer(
  seriesSearchHandler: SeriesSearchHandler
) {
  const server = new McpServer({
    name: "Series Search MCP Server",
    version: "1.0.0",
  });

  server.tool(
    SERIES_SEARCH_TOOL_NAME,
    "Search the web for TV series recommendations and return personalized series recommendations.",
    {
      query: z
        .string()
        .min(1)
        .describe(
          "A semantic TV series recommendation request, for example: 'Recommend dark mystery series with time travel.'"
        ),
    },
    async ({ query }: SeriesSearchToolInput) => {
      const result = await seriesSearchHandler(query);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    }
  );

  return server;
}

async function searchSeriesOnWeb(
  query: string
): Promise<SeriesSearchToolResponse> {
  const { webSearchTool } = await import("../seriesWebSearch.js");
  const series = await webSearchTool(query);

  return {
    series,
  };
}
