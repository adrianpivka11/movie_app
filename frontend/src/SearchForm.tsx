import type { FormAnswers } from "./types";

type SearchFormProps = {
  getMovies: (formAnswers: FormAnswers) => Promise<void>;
  handleButtonClick: () => void;
  isLoading: boolean;
};

export default function SearchForm({ getMovies, isLoading, handleButtonClick }: SearchFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const formAnswers: FormAnswers = {
      mood: formData.get("mood")?.toString() ?? "",
      genre: formData.get("genre")?.toString() ?? "",
      story: formData.get("story")?.toString() ?? ""
    };

    void getMovies(formAnswers);
  }

  return (
    <main className="app">
      <img src="/chatgpt_cats_movie.png" alt="MovieChoice popcorn logo" className="logo" />
      <h1>MovieChoice</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="mood">What mood do you prefer?</label>
        <textarea
          id="mood"
          name="mood"
          placeholder="I’m looking for a light-hearted, funny movie that will help me relax. I’d prefer something fast-paced, not too romantic, and with a happy ending."
        />

        <label htmlFor="genre">What genre or combination of genres would you prefer?</label>
        <textarea
          id="genre"
          name="genre"
          placeholder="I’d like a mix of mystery and science fiction, but not too much horror."
        />

        <label htmlFor="story">What would you like the story to be about?</label>
        <textarea
          id="story"
          name="story"
          placeholder="I’d like a mix of mystery and science fiction, ideally with some psychological elements, but not too much horror."
        />

        <button type="submit" onClick={handleButtonClick} className= {isLoading ? "button-loading" : ""}> 
          {isLoading ? "is Loading..." : "Search"}  
        </button>
      </form>
    </main>
  );
}
