import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../app.js";
import type { AgentOutput } from "../types.js";

const emptyAgentOutput: AgentOutput = {
  movies: [],
  series: [],
};

describe("Express app", () => {
  it("responds to the health check endpoint", async () => {
    const app = createApp(async () => emptyAgentOutput);

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("responds to the warmup endpoint with MCP service results", async () => {
    const warmupResults = [
      { service: "movie-rag" as const, ok: true, statusCode: 200 },
      { service: "series-search" as const, ok: true, statusCode: 200 },
    ];
    const warmupHandler = vi.fn().mockResolvedValue(warmupResults);
    const app = createApp(async () => emptyAgentOutput, warmupHandler);

    const response = await request(app).get("/api/warmup");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      services: warmupResults,
    });
    expect(warmupHandler).toHaveBeenCalledOnce();
  });

  it("returns 400 when recommendation request is empty", async () => {
    const recommendationHandler = vi.fn().mockResolvedValue(emptyAgentOutput);
    const app = createApp(recommendationHandler);

    const response = await request(app)
      .post("/api/recommend")
      .send({ movieOrSerieUserRequest: "   " });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Please describe what kind of movie or series you want.",
    });
    expect(recommendationHandler).not.toHaveBeenCalled();
  });

  it("returns 400 when recommendation request field is missing", async () => {
    const recommendationHandler = vi.fn().mockResolvedValue(emptyAgentOutput);
    const app = createApp(recommendationHandler);

    const response = await request(app).post("/api/recommend").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Please describe what kind of movie or series you want.",
    });
    expect(recommendationHandler).not.toHaveBeenCalled();
  });

  it("returns stable agenticStructuredData on successful recommendation", async () => {
    const recommendationHandler = vi.fn().mockResolvedValue(emptyAgentOutput);
    const app = createApp(recommendationHandler);

    const response = await request(app)
      .post("/api/recommend")
      .send({ movieOrSerieUserRequest: "Recommend hopeful sci-fi movies." });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      agenticStructuredData: emptyAgentOutput,
    });
    expect(recommendationHandler).toHaveBeenCalledWith(
      "Recommend hopeful sci-fi movies."
    );
  });

  it("trims recommendation request before calling the handler", async () => {
    const recommendationHandler = vi.fn().mockResolvedValue(emptyAgentOutput);
    const app = createApp(recommendationHandler);

    await request(app)
      .post("/api/recommend")
      .send({ movieOrSerieUserRequest: "   Recommend a drama.   " });

    expect(recommendationHandler).toHaveBeenCalledWith("Recommend a drama.");
  });

  it("returns 500 with a public error message when recommendation handler fails", async () => {
    const recommendationHandler = vi
      .fn()
      .mockRejectedValue(new Error("OpenAI exploded internally"));
    const app = createApp(recommendationHandler);

    const response = await request(app)
      .post("/api/recommend")
      .send({ movieOrSerieUserRequest: "Recommend a thriller." });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Recommendation service is temporarily unavailable. Please try again.",
    });
  });
});
