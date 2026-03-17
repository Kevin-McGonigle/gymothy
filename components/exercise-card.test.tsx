import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Exercise } from "@/lib/exercises/types";
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

describe("ExerciseCard", () => {
  it("displays exercise name", () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText("Barbell Bench Press")).toBeInTheDocument();
  });

  it("displays target muscle group", () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText("pectorals")).toBeInTheDocument();
  });

  it("displays body part", () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText("chest")).toBeInTheDocument();
  });

  it("displays equipment", () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText("barbell")).toBeInTheDocument();
  });

  it("displays secondary muscles", () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.getByText("triceps")).toBeInTheDocument();
    expect(screen.getByText("deltoids")).toBeInTheDocument();
  });

  it("calls onClick when card is clicked", () => {
    const onClick = vi.fn();
    render(<ExerciseCard exercise={mockExercise} onClick={onClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith(mockExercise);
  });

  it("has minimum touch target when onClick provided", () => {
    const onClick = vi.fn();
    render(<ExerciseCard exercise={mockExercise} onClick={onClick} />);

    const card = screen.getByRole("button");
    expect(card).toHaveClass("min-h-[2.75rem]");
  });

  it("does not have button role when onClick not provided", () => {
    render(<ExerciseCard exercise={mockExercise} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
