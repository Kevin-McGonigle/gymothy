import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ROUTES } from "@/shared/constants";
import { RoutinesEmpty } from "./routines-empty";

describe("RoutinesEmpty", () => {
  it("renders title and description", () => {
    render(<RoutinesEmpty />);

    expect(screen.getByText("No routines yet")).toBeInTheDocument();
    expect(
      screen.getByText("Routines are workout templates you can reuse."),
    ).toBeInTheDocument();
  });

  it("renders CTA linking to create routine", () => {
    render(<RoutinesEmpty />);

    const cta = screen.getByRole("link", {
      name: /create your first routine/i,
    });
    expect(cta).toHaveAttribute("href", ROUTES.ROUTINE_NEW);
  });
});
