

export type FormAnswers = {
  mood: string;
  genre: string;
  story: string;
};


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


export type RecommendedMovie = {
      title:string,
      year: string,
      poster_path: string,
      ai_response: string,
      index: number,
      isLast: boolean,}
