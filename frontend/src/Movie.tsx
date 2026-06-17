import MovieActions from "./MovieActions";
import type { RecommendedMovie } from "./types";

type MovieProps = {
  moviesObj: RecommendedMovie;
  decreaseIndex: () => void;
  increaseIndex: () => void;
  newSearchRefreshPage: () => void;
};

export default function Movie({
  moviesObj,
  decreaseIndex,
  increaseIndex,
  newSearchRefreshPage
}: MovieProps) {
  const posterUrl = moviesObj.poster_path
    ? `https://image.tmdb.org/t/p/w500/${moviesObj.poster_path}`
    : undefined;

  return (
    <main className="app movie-page">
      <article className="movie-card">
        <h1 className="movie-title">
          {moviesObj.title} {moviesObj.year && <span>({moviesObj.year})</span>}
        </h1>

        {posterUrl && (
          <img src={posterUrl} alt={`${moviesObj.title} poster`} className="movie-poster" />
        )}

        <p className="movie-description">{moviesObj.ai_response}</p>

        <MovieActions
          movie={moviesObj}
          decreaseIndex={decreaseIndex}
          increaseIndex={increaseIndex}
          newSearchRefreshPage={newSearchRefreshPage}
        />
      </article>
    </main>
  );
}
