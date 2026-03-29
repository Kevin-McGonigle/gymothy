import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ROUTES } from "@/shared/constants";
import { HistoryEmpty } from "./history-empty";

describe("HistoryEmpty", () => {
  it("renders title and onboarding description", () => {
    render(<HistoryEmpty />);

    expect(screen.getByText("No workouts yet")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Start a workout, track your sets, and get smarter suggestions each session.",
      ),
    ).toBeInTheDocument();
  });

  it("renders CTA linking to start workout", () => {
    render(<HistoryEmpty />);

    const cta = screen.getByRole("link", { name: /start your first workout/i });
    expect(cta).toHaveAttribute("href", ROUTES.WORKOUT_NEW);
  });
});
