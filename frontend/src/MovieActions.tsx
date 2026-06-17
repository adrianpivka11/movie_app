import type { RecommendedMovie } from "./types";

type MovieActionsProps = {
  movie: RecommendedMovie;
  decreaseIndex: () => void;
  increaseIndex: () => void;
  newSearchRefreshPage: () => void;
};

export default function MovieActions({
  movie,
  decreaseIndex,
  increaseIndex,
  newSearchRefreshPage
}: MovieActionsProps) {
  return (
    <div className="movie-actions">
      {movie.index !== 0 && (
        <button type="button" onClick={decreaseIndex}>
          Previous
        </button>
      )}

      {movie.isLast ? (
        <button type="button" onClick={newSearchRefreshPage}>
          New search
        </button>
      ) : (
        <button type="button" onClick={increaseIndex}>
          Next Movie
        </button>
      )}
    </div>
  );
}
