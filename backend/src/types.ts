export type RecommendedMovie = {
      title:string,
      year: string,
      poster_path: string,
      overview: string,
      index: number,
      isLast: boolean,}

export type MovieRecommendation = Omit<RecommendedMovie, "overview"> & {
      recommendation: string,
}

export type SeriesRecommendation = {
      title: string,
      year: number | null,
      recommendation: string,
}


export type MovieAPI = {
      director:string, 
      genres:string, 
      id: number,
      main_cast:string,
      original_language:string,
      overview:string,
      poster_path:string,
      release_date:string,
      runtime: number,
      similarity: number,
      title:string,
      vote_average: number,
      vote_count: number,}

export type RecommendationsByLLM = {
      index: number,
      recommendation: string,
}


export type AgentOutput = {
  movies: MovieRecommendation[];
  series: SeriesRecommendation[];
};
