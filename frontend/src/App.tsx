import { useState } from "react";
import SearchForm from "./SearchForm";
import Movie from "./Movie";
import type { FormAnswers, RecommendedMovie, MovieAPI } from "./types";










const testMovieArr = [
  {
    title: "The Noise",
    year: 2015,
    poster_path: "/tDjiRpJTDaN08Ezn5rgntsMqvUr.jpg",
    ai_response: "You will like this movie because it has the same tense energy you described."
  },
  {
    title: "Finding Satoshi",
    year: 2019,
    poster_path: "/kZ5Jum0zjl0g1IAVl258a77zx0c.jpg",
    ai_response: "This one leans into mystery and obsession, which fits your prompt nicely."
  },
  {
    title: "Life Is Beautiful",
    year: 2024,
    poster_path: "/6tEJnof1DKWPnl5lzkjf0FVv7oB.jpg",
    ai_response: "A warmer pick if you want something emotionally bright."
  }
];

export default function App() {
  const [moviesArr, setMoviesArr] = useState<RecommendedMovie[]>([]);
  const [movieIndex, setMovieIndex] = useState(0);
  const [favoriteMovie, setFavoriteMovie] = useState("");

  async function getMovies(formAnswers: FormAnswers) {
    setFavoriteMovie(formAnswers.favoriteMovie);

    try {
    // send fetch request to /api/recommend
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formAnswers),
    });

    const data = await response.json()
    console.log('Data received on client side', data.movies)
    const receivedMovies: MovieAPI[]=data.movies


    const moviesWithIndexToRender: RecommendedMovie[] = receivedMovies.map((movie, index) => ({
      title: movie.title,
      year: movie.release_date,
      poster_path: movie.poster_path,
      ai_response: movie.overview,
      index,
      isLast: index === testMovieArr.length - 1
    }));

    setMoviesArr(moviesWithIndexToRender);
  



    if (!response.ok) {
      throw new Error(data.error ?? "Request failed")
    }

    

    // Convert Markdown to HTML
    

    // Sanitize the HTML to prevent XSS attacks
    

    // Render the result
    
  } catch (error) {
    // Log the error for debugging
    console.error(error);

    // Display friendly error message
    
  }}




  





















  function increaseIndex() {
    setMovieIndex((prevMovieIndex) => prevMovieIndex + 1);
  }

  function decreaseIndex() {
    setMovieIndex((prevMovieIndex) => prevMovieIndex - 1);
  }

  function newSearchRefreshPage() {
    setMoviesArr([]);
    setMovieIndex(0);
  }

  return moviesArr.length === 0 ? (
    <SearchForm getMovies={getMovies} favoriteMovie={favoriteMovie} />
  ) : (
    <Movie
      moviesObj={moviesArr[movieIndex]}
      increaseIndex={increaseIndex}
      decreaseIndex={decreaseIndex}
      newSearchRefreshPage={newSearchRefreshPage}
    />
  );
}
