import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/shared/constants";
import { BottomNav } from "./bottom-nav";

const mockUsePathname = vi.fn(() => "/");

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

describe("BottomNav", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

  it("renders History, Start Workout, and Routines links", () => {
    render(<BottomNav />);

    const historyLink = screen.getByRole("link", { name: /history/i });
    const startLink = screen.getByRole("link", { name: /start workout/i });
    const routinesLink = screen.getByRole("link", { name: /routines/i });

    expect(historyLink).toHaveAttribute("href", ROUTES.HOME);
    expect(startLink).toHaveAttribute("href", ROUTES.WORKOUT_NEW);
    expect(routinesLink).toHaveAttribute("href", ROUTES.ROUTINES);
  });

  it("marks History as active when on /", () => {
    mockUsePathname.mockReturnValue("/");
    render(<BottomNav />);

    expect(screen.getByRole("link", { name: /history/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /routines/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks Routines as active when on /routines", () => {
    mockUsePathname.mockReturnValue("/routines");
    render(<BottomNav />);

    expect(screen.getByRole("link", { name: /routines/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: /history/i })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks no tab as active on unrelated paths", () => {
    mockUsePathname.mockReturnValue("/settings");
    render(<BottomNav />);

    expect(screen.getByRole("link", { name: /history/i })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: /routines/i })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
