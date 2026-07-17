import { useState } from "react";
import SearchForm from "./SearchForm";
import Movie from "./Movie";
import type { FormAnswers, MoviesFromServer } from "./types";




export default function App() {
  const [moviesArr, setMoviesArr] = useState<MoviesFromServer[]>([]);
  const [movieIndex, setMovieIndex] = useState(0);
  const [favoriteMovie, setFavoriteMovie] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleButtonClick() {
    setIsLoading(prevIsLoading => !prevIsLoading);
  }

  async function getMovies(formAnswers: FormAnswers) {
    setFavoriteMovie(formAnswers.movieOrSerieUserRequest);

    try {
    // send fetch request to /api/recommend
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formAnswers),
    });

    const data = await response.json()
    console.log('[NORMAL CLIENT] Data received on client side', data)
    const moviesFromServer: MoviesFromServer[] = data.movies
    // set received data to React State
    setMoviesArr(moviesFromServer);
  



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
    setIsLoading(prevIsLoading => !prevIsLoading)
  }

  return moviesArr.length === 0 ? (
    <SearchForm getMovies={getMovies} favoriteMovie={favoriteMovie} handleButtonClick={handleButtonClick} isLoading={isLoading} />
  ) : (
    <Movie
      moviesObj={moviesArr[movieIndex]}
      increaseIndex={increaseIndex}
      decreaseIndex={decreaseIndex}
      newSearchRefreshPage={newSearchRefreshPage}
    />
  );
}
