import { useState } from "react";
import SearchForm from "./SearchForm";
import Movie from "./Movie";
import type { FormAnswers, MoviesFromServer, SeriesFromServer } from "./types";
import Series from "./Series";




export default function App() {
  const [moviesArr, setMoviesArr] = useState<MoviesFromServer[]>([]);
  const [seriesArr, setSeriesArr] = useState<SeriesFromServer[]>([])
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

    // set received data to React State - Movies or Series. They will be set to Array with values, which will change the state.
    // Or they will be set to empty array which will maintain default state and conditional rendering on default.
    
    const moviesFromServer: MoviesFromServer[] = data.agenticStructuredData.movies
    const seriesFromServer: SeriesFromServer[] = data.agenticStructuredData.series
    setMoviesArr(moviesFromServer);
    setSeriesArr(seriesFromServer)
  



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
    setSeriesArr([])
    setMovieIndex(0);
    setIsLoading(prevIsLoading => !prevIsLoading)
  }

  // conditional rendering of React components - Movies and Series

  return  moviesArr.length !== 0  && seriesArr.length === 0 ?
        
                (<Movie
                  moviesObj={moviesArr[movieIndex]}
                  increaseIndex={increaseIndex}
                  decreaseIndex={decreaseIndex}
                  newSearchRefreshPage={newSearchRefreshPage}
                />)

          : seriesArr.length !== 0 && moviesArr.length === 0 ? 

                (<Series
                  series={seriesArr}
                  newSearchRefreshPage={newSearchRefreshPage}
                />) 

          
          : seriesArr.length !== 0 && moviesArr.length !== 0 ? 
                (
                  <>
                    <Movie
                      moviesObj={moviesArr[movieIndex]}
                      increaseIndex={increaseIndex}
                      decreaseIndex={decreaseIndex}
                      newSearchRefreshPage={newSearchRefreshPage}
                    />
                    <Series 
                      series={seriesArr}
                      newSearchRefreshPage={newSearchRefreshPage}
                     />
                  </>
                )
                  
          : 

            (<SearchForm getMovies={getMovies} favoriteMovie={favoriteMovie} handleButtonClick={handleButtonClick} isLoading={isLoading} />) 
}
