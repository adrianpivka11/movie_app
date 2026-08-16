import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import SearchForm from "../SearchForm";

function renderSearchForm(overrides = {}) {
  const defaultProps = {
    favoriteMovie: "",
    getMovies: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    errorMessage: "",
  };

  return {
    props: defaultProps,
    user: userEvent.setup(),
    ...render(<SearchForm {...defaultProps} {...overrides} />),
  };
}

describe("SearchForm", () => {
  it("shows loading state and disables submit button", () => {
    renderSearchForm({ isLoading: true });

    const button = screen.getByRole("button", { name: /loading/i });

    expect(button).toBeDisabled();
    expect(button).toHaveClass("button-loading");
  });

  it("shows an error message when one is provided", () => {
    renderSearchForm({ errorMessage: "Recommendation service failed." });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Recommendation service failed."
    );
  });

  it("submits the textarea value to getMovies", async () => {
    const getMovies = vi.fn().mockResolvedValue(undefined);
    const { user } = renderSearchForm({ getMovies });

    await user.type(
      screen.getByRole("textbox"),
      "Recommend me a hopeful sci-fi movie."
    );
    await user.click(screen.getByRole("button", { name: /search/i }));

    expect(getMovies).toHaveBeenCalledWith({
      movieOrSerieUserRequest: "Recommend me a hopeful sci-fi movie.",
    });
  });
});
