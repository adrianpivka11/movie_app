import { useState } from "react";
import SearchForm from "./SearchForm";
import Movie from "./Movie";
import type { FormAnswers, RecommendedMovie, MovieAPI } from "./types";


const API_URL = import.meta.env.VITE_API_URL ?? "";

export default function App() {
  const [moviesArr, setMoviesArr] = useState<RecommendedMovie[]>([]);
  const [movieIndex, setMovieIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false)
  
  function handleButtonClick(){
    setIsLoading(prevIsLoading => !prevIsLoading)
  }

  async function getMovies(formAnswers: FormAnswers) {

    try {
    // send fetch request to /api/recommend
    const response = await fetch(`${API_URL}/api/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formAnswers),
    });

    const data = await response.json()
    console.log('Data received on client side', data.movies)
    const receivedMovies: MovieAPI[]=data.movies


    const moviesWithIndexToRender: RecommendedMovie[] = receivedMovies.map((movie, index) => ({
      title: movie.title,
      year: movie.release_date ? movie.release_date.slice(0, 4) : "Unknown",
      poster_path: movie.poster_path,
      ai_response: movie.overview,
      index,
      isLast: index === receivedMovies.length - 1
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
    setIsLoading(prevIsLoading => !prevIsLoading)
  }

  return moviesArr.length === 0 ? (
    <SearchForm getMovies={getMovies} handleButtonClick={handleButtonClick} isLoading={isLoading} />
  ) : (
    <Movie
      moviesObj={moviesArr[movieIndex]}
      increaseIndex={increaseIndex}
      decreaseIndex={decreaseIndex}
      newSearchRefreshPage={newSearchRefreshPage}
    />
  );
}
