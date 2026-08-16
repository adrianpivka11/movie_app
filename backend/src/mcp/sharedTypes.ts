import type { MovieRecommendation, SeriesRecommendation } from "../types.js";

export const MOVIE_RAG_TOOL_NAME = "searchMoviesBySimilarity" as const;
export const SERIES_SEARCH_TOOL_NAME = "searchSeriesOnWeb" as const;

export type MovieRagToolInput = {
  query: string;
};

export type MovieRagToolResponse = {
  movies: MovieRecommendation[];
};

export type SeriesSearchToolInput = {
  query: string;
};

export type SeriesSearchToolResponse = {
  series: SeriesRecommendation[];
};

export type McpToolName =
  | typeof MOVIE_RAG_TOOL_NAME
  | typeof SERIES_SEARCH_TOOL_NAME;
