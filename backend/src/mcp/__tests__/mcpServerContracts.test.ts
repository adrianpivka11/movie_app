import { afterEach, describe, expect, it, vi } from "vitest";
import {
  callMovieRagMcp,
  callSeriesSearchMcp,
} from "../mcpClient.js";
import { createMovieRagMcpApp } from "../movieRagMcpApp.js";
import { createSeriesSearchMcpApp } from "../seriesSearchMcpApp.js";
import { startTestServer } from "./testServer.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("MCP server contracts", () => {
  it("movie RAG MCP server returns { movies }", async () => {
    const movieHandler = vi.fn().mockResolvedValue({
      movies: [
        {
          title: "Interstellar",
          year: "2014",
          poster_path: "/interstellar.jpg",
          index: 0,
          isLast: true,
          recommendation: "A large-scale sci-fi movie about survival and hope.",
        },
      ],
    });
    const app = createMovieRagMcpApp(movieHandler);
    const server = await startTestServer(app);
    vi.stubEnv("MOVIE_RAG_MCP_URL", `${server.baseUrl}/mcp`);

    try {
      const response = await callMovieRagMcp("Recommend survival sci-fi.");

      expect(response).toEqual({
        movies: [
          {
            title: "Interstellar",
            year: "2014",
            poster_path: "/interstellar.jpg",
            index: 0,
            isLast: true,
            recommendation:
              "A large-scale sci-fi movie about survival and hope.",
          },
        ],
      });
      expect(movieHandler).toHaveBeenCalledWith("Recommend survival sci-fi.");
    } finally {
      await server.close();
    }
  });

  it("series search MCP server returns { series }", async () => {
    const seriesHandler = vi.fn().mockResolvedValue({
      series: [
        {
          title: "Severance",
          year: 2022,
          recommendation: "A tense workplace mystery with sci-fi themes.",
        },
      ],
    });
    const app = createSeriesSearchMcpApp(seriesHandler);
    const server = await startTestServer(app);
    vi.stubEnv("SERIES_SEARCH_MCP_URL", `${server.baseUrl}/mcp`);

    try {
      const response = await callSeriesSearchMcp("Recommend workplace sci-fi.");

      expect(response).toEqual({
        series: [
          {
            title: "Severance",
            year: 2022,
            recommendation: "A tense workplace mystery with sci-fi themes.",
          },
        ],
      });
      expect(seriesHandler).toHaveBeenCalledWith("Recommend workplace sci-fi.");
    } finally {
      await server.close();
    }
  });
});
