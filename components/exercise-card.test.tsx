import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Exercise } from "@/lib/exercises/types";
import type { ExerciseWithSource } from "@/lib/exercises/use-exercises";
import { ExerciseCard } from "./exercise-card";

const mockExercise: Exercise = {
  exerciseId: "abc123",
  name: "Barbell Bench Press",
  gifUrl: "https://example.com/image.gif",
  targetMuscles: ["pectorals"],
  bodyParts: ["chest"],
  equipments: ["barbell"],
  secondaryMuscles: ["triceps", "deltoids"],
  instructions: ["Lie on a bench", "Press up"],
};

const mockCustomExercise: ExerciseWithSource = {
  ...mockExercise,
  isCustom: true,
  userId: "user_123",
};

describe("ExerciseCard", () => {
  it("displays exercise name", () => {
    render(<ExerciseCard exercise={{ variant: "api", data: mockExercise }} />);
    expect(screen.getByText("Barbell Bench Press")).toBeInTheDocument();
  });

  it("displays target muscle group", () => {
    render(<ExerciseCard exercise={{ variant: "api", data: mockExercise }} />);
    expect(screen.getByText("pectorals")).toBeInTheDocument();
  });

  it("displays body part", () => {
    render(<ExerciseCard exercise={{ variant: "api", data: mockExercise }} />);
    expect(screen.getByText("chest")).toBeInTheDocument();
  });

  it("displays equipment", () => {
    render(<ExerciseCard exercise={{ variant: "api", data: mockExercise }} />);
    expect(screen.getByText("barbell")).toBeInTheDocument();
  });

  it("displays secondary muscles", () => {
    render(<ExerciseCard exercise={{ variant: "api", data: mockExercise }} />);
    expect(screen.getByText("triceps")).toBeInTheDocument();
    expect(screen.getByText("deltoids")).toBeInTheDocument();
  });

  it("displays custom badge for custom exercises", () => {
    render(
      <ExerciseCard
        exercise={{ variant: "custom", data: mockCustomExercise }}
      />,
    );
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("does not display custom badge for API exercises", () => {
    render(<ExerciseCard exercise={{ variant: "api", data: mockExercise }} />);
    expect(screen.queryByText("Custom")).not.toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    const onClick = vi.fn();
    render(
      <ExerciseCard
        exercise={{ variant: "api", data: mockExercise }}
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith({ ...mockExercise, isCustom: false });
  });

  it("calls onClick with custom exercise data when clicked", () => {
    const onClick = vi.fn();
    render(
      <ExerciseCard
        exercise={{ variant: "custom", data: mockCustomExercise }}
        onClick={onClick}
      />,
    );

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith(mockCustomExercise);
  });

  it("has minimum touch target when onClick provided", () => {
    const onClick = vi.fn();
    render(
      <ExerciseCard
        exercise={{ variant: "api", data: mockExercise }}
        onClick={onClick}
      />,
    );

    const card = screen.getByRole("button");
    expect(card).toHaveClass("min-h-[2.75rem]");
  });

  it("does not have button role when onClick not provided", () => {
    render(<ExerciseCard exercise={{ variant: "api", data: mockExercise }} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
