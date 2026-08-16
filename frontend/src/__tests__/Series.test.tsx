import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import Series from "../Series";
import type { SeriesFromServer } from "../types";

const series: SeriesFromServer[] = [
  {
    title: "Severance",
    year: 2022,
    recommendation: "A sharp workplace mystery with unsettling sci-fi ideas.",
  },
  {
    title: "Dark",
    year: 2017,
    recommendation: "A layered time-travel series with a serious atmosphere.",
  },
];

describe("Series", () => {
  it("renders series titles, years, and recommendations", () => {
    render(<Series series={series} newSearchRefreshPage={vi.fn()} />);

    expect(screen.getByText("Severance (2022)")).toBeInTheDocument();
    expect(screen.getByText("Dark (2017)")).toBeInTheDocument();
    expect(
      screen.getByText("A sharp workplace mystery with unsettling sci-fi ideas.")
    ).toBeInTheDocument();
    expect(
      screen.getByText("A layered time-travel series with a serious atmosphere.")
    ).toBeInTheDocument();
  });

  it("calls newSearchRefreshPage when New search is clicked", async () => {
    const user = userEvent.setup();
    const newSearchRefreshPage = vi.fn();

    render(
      <Series series={series} newSearchRefreshPage={newSearchRefreshPage} />
    );

    await user.click(screen.getByRole("button", { name: /new search/i }));

    expect(newSearchRefreshPage).toHaveBeenCalledOnce();
  });
});
