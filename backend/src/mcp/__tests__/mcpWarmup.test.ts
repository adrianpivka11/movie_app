import express from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { warmupMcpServices } from "../mcpClient.js";
import { startTestServer } from "./testServer.js";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("MCP warmup", () => {
  it("returns ok results when both MCP health endpoints respond successfully", async () => {
    const movieHealthApp = express().get("/health", (_req, res) => {
      res.json({ status: "ok", service: "movie-rag-mcp" });
    });
    const seriesHealthApp = express().get("/health", (_req, res) => {
      res.json({ status: "ok", service: "series-search-mcp" });
    });
    const movieServer = await startTestServer(movieHealthApp);
    const seriesServer = await startTestServer(seriesHealthApp);

    vi.stubEnv("MOVIE_RAG_MCP_HEALTH_URL", `${movieServer.baseUrl}/health`);
    vi.stubEnv(
      "SERIES_SEARCH_MCP_HEALTH_URL",
      `${seriesServer.baseUrl}/health`
    );

    try {
      const results = await warmupMcpServices();

      expect(results).toEqual([
        { service: "movie-rag", ok: true, statusCode: 200 },
        { service: "series-search", ok: true, statusCode: 200 },
      ]);
    } finally {
      await movieServer.close();
      await seriesServer.close();
    }
  });

  it("returns a failed result when one MCP health endpoint fails", async () => {
    const movieHealthApp = express().get("/health", (_req, res) => {
      res.status(503).json({ status: "unavailable" });
    });
    const seriesHealthApp = express().get("/health", (_req, res) => {
      res.json({ status: "ok", service: "series-search-mcp" });
    });
    const movieServer = await startTestServer(movieHealthApp);
    const seriesServer = await startTestServer(seriesHealthApp);

    vi.stubEnv("MOVIE_RAG_MCP_HEALTH_URL", `${movieServer.baseUrl}/health`);
    vi.stubEnv(
      "SERIES_SEARCH_MCP_HEALTH_URL",
      `${seriesServer.baseUrl}/health`
    );

    try {
      const results = await warmupMcpServices();

      expect(results).toEqual([
        { service: "movie-rag", ok: false, statusCode: 503 },
        { service: "series-search", ok: true, statusCode: 200 },
      ]);
    } finally {
      await movieServer.close();
      await seriesServer.close();
    }
  });
});
