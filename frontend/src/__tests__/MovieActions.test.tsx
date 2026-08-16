import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MovieActions from "../MovieActions";
import type { MoviesFromServer } from "../types";

function createMovie(overrides: Partial<MoviesFromServer> = {}): MoviesFromServer {
  return {
    title: "Interstellar",
    year: "2014",
    poster_path: "/poster.jpg",
    index: 0,
    isLast: false,
    recommendation: "A thoughtful sci-fi recommendation.",
    ...overrides,
  };
}

function renderMovieActions(movie: MoviesFromServer) {
  const props = {
    movie,
    decreaseIndex: vi.fn(),
    increaseIndex: vi.fn(),
    newSearchRefreshPage: vi.fn(),
  };

  return {
    props,
    user: userEvent.setup(),
    ...render(<MovieActions {...props} />),
  };
}

describe("MovieActions", () => {
  it("does not show Previous button for the first movie", () => {
    renderMovieActions(createMovie({ index: 0 }));

    expect(screen.queryByRole("button", { name: /previous/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next movie/i })).toBeInTheDocument();
  });

  it("calls increaseIndex when Next Movie is clicked", async () => {
    const { props, user } = renderMovieActions(createMovie({ isLast: false }));

    await user.click(screen.getByRole("button", { name: /next movie/i }));

    expect(props.increaseIndex).toHaveBeenCalledOnce();
  });

  it("shows New search for the last movie", async () => {
    const { props, user } = renderMovieActions(
      createMovie({ index: 2, isLast: true })
    );

    await user.click(screen.getByRole("button", { name: /new search/i }));

    expect(props.newSearchRefreshPage).toHaveBeenCalledOnce();
  });
});
