import type { FormAnswers } from "./types";

type SearchFormProps = {
  favoriteMovie: string;
  getMovies: (formAnswers: FormAnswers) => Promise<void>;
  
  isLoading: boolean
  errorMessage: string;
};

export default function SearchForm({ favoriteMovie, getMovies, isLoading, errorMessage }: SearchFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const formAnswers: FormAnswers = {
      movieOrSerieUserRequest: formData.get("movieOrSerieUserRequest")?.toString() ?? "",

    };

    void getMovies(formAnswers);
  }

  return (
    <main className="app">
      <img src="/chatgpt_cats_movie.png" alt="MovieChoice popcorn logo" className="logo" />
      <h1>MovieChoice</h1>
      <h2>AI Movie Recommendation Engine</h2>

      <form onSubmit={handleSubmit}>
        <label htmlFor="favoriteMovie">Describe what kind of movie or series you would like to what...</label>
        <textarea
          id="movieOrSerieUserRequest"
          name="movieOrSerieUserRequest"
          placeholder="Recommend me a movie or/and series about survival and hope, ideally a sci-fi or drama."
          defaultValue=""
        />

        

        <button type="submit" disabled={isLoading} className={isLoading ? "button-loading" : ""}>
          {isLoading ? "Loading..." : "Search"}
        </button>
          
       
        {errorMessage && (
          <p className="error-message" role="alert">
            {errorMessage}
          </p>
        )}
      </form>
    </main>
  );
}
