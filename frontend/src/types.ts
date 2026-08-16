export type FormAnswers = {
  movieOrSerieUserRequest: string;
  
};


export type MoviesFromServer = {
      title:string,
      year: string,
      poster_path: string,
      index: number,
      isLast: boolean,
      recommendation: string,}


export type SeriesFromServer = {
    title: string,
    year: number | null,
    recommendation: string,
}

export type AgenticStructuredData = {
    movies: MoviesFromServer[],
    series: SeriesFromServer[],
}

export type RecommendApiSuccessResponse = {
    agenticStructuredData: AgenticStructuredData,
    error?: never,
}

export type RecommendApiErrorResponse = {
    error: string,
    agenticStructuredData?: never,
}

export type RecommendApiResponse =
    | RecommendApiSuccessResponse
    | RecommendApiErrorResponse
