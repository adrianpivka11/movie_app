export type FormAnswers = {
  movieOrSerieUserRequest: string;
  
};


export type MoviesFromServer = {
      title:string,
      year: string,
      poster_path: string,
      overview: string,
      index: number,
      isLast: boolean,
      recommendation: string,}


export type SeriesFromServer = {
    title: string,
    year: number,
    recommendation: string,
}