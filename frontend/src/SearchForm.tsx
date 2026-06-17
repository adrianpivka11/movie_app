import type { FormAnswers } from "./types";

type SearchFormProps = {
  favoriteMovie: string;
  getMovies: (formAnswers: FormAnswers) => Promise<void>;
};

export default function SearchForm({ favoriteMovie, getMovies }: SearchFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const formAnswers: FormAnswers = {
      favoriteMovie: formData.get("favoriteMovie")?.toString() ?? "",
      mood: formData.get("mood")?.toString() ?? "",
      tone: formData.get("tone")?.toString() ?? ""
    };

    void getMovies(formAnswers);
  }

  return (
    <main className="app">
      <img src="/chatgpt_cats_movie.png" alt="MovieChoice popcorn logo" className="logo" />
      <h1>MovieChoice</h1>

      <form onSubmit={handleSubmit}>
        <label htmlFor="favoriteMovie">What's your favorite movie and why?</label>
        <textarea
          id="favoriteMovie"
          name="favoriteMovie"
          placeholder="The Shawshank Redemption because it taught me to never give up hope no matter how hard life gets"
          defaultValue="The Shawshank Redemption because it taught me to never give up hope no matter how hard life gets"
        />

        <label htmlFor="mood">Are you in the mood for something new or a classic?</label>
        <textarea
          id="mood"
          name="mood"
          placeholder="I want to watch movie classics that were released after 2000"
          defaultValue="I want to watch movie classics that were released after 2000"
        />

        <label htmlFor="tone">Do you wanna have fun or do you want something serious?</label>
        <textarea
          id="tone"
          name="tone"
          placeholder="I want to watch something stupid and fun. I need something simple after stressful day."
          defaultValue="I want to watch something stupid and fun. I need something simple after stressful day."
        />

        <button type="submit">Let's Go</button>
      </form>
    </main>
  );
}
