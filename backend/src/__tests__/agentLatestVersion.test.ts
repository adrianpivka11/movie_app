import { describe, expect, it } from "vitest";
import { detectRecommendationIntent } from "../agentLatestVersion.js";

describe("latest MCP router agent", () => {
  it("routes movie requests to the movie MCP service", () => {
    expect(detectRecommendationIntent("Recommend WW2 movies")).toBe("movies");
    expect(detectRecommendationIntent("Odporuc mi historicke filmy")).toBe(
      "movies"
    );
  });

  it("routes series requests to the series MCP service", () => {
    expect(detectRecommendationIntent("Recommend romantic series")).toBe(
      "series"
    );
    expect(detectRecommendationIntent("Odporuc mi mysteriozne serialy")).toBe(
      "series"
    );
  });

  it("routes mixed or ambiguous requests to both MCP services", () => {
    expect(
      detectRecommendationIntent("Recommend WW2 movies and romantic series")
    ).toBe("both");
    expect(detectRecommendationIntent("Recommend something dark")).toBe("both");
  });
});
