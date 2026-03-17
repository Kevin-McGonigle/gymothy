import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Exercise } from "@/lib/exercises/types";
import { ExerciseList } from "./exercise-list";

const mockExercises: Exercise[] = [
  {
    exerciseId: "abc123",
    name: "Barbell Bench Press",
    gifUrl: "https://example.com/bench.gif",
    targetMuscles: ["pectorals"],
    bodyParts: ["chest"],
    equipments: ["barbell"],
    secondaryMuscles: ["triceps"],
    instructions: ["Lie on bench", "Press up"],
  },
  {
    exerciseId: "def456",
    name: "Dumbbell Curl",
    gifUrl: "https://example.com/curl.gif",
    targetMuscles: ["biceps"],
    bodyParts: ["upper arms"],
    equipments: ["dumbbell"],
    secondaryMuscles: [],
    instructions: ["Curl weight"],
  },
];

describe("ExerciseList", () => {
  it("displays loading skeletons when loading is true", () => {
    render(<ExerciseList loading={true} exercises={[]} />);

    const loadingRegion = screen.getByLabelText("Loading exercises");
    const skeletonElements = loadingRegion.querySelectorAll(".rounded-lg");
    expect(skeletonElements).toHaveLength(6);
  });

  it("displays empty state when no exercises", () => {
    render(<ExerciseList exercises={[]} />);

    expect(screen.getByText("No exercises found")).toBeInTheDocument();
    expect(screen.getByText(/Try adjusting your search/i)).toBeInTheDocument();
  });

  it("displays exercise cards when exercises provided", () => {
    render(<ExerciseList exercises={mockExercises} />);

    expect(screen.getByText("Barbell Bench Press")).toBeInTheDocument();
    expect(screen.getByText("Dumbbell Curl")).toBeInTheDocument();
  });

  it("calls onExerciseClick when card is clicked", () => {
    const onClick = vi.fn();
    render(
      <ExerciseList exercises={mockExercises} onExerciseClick={onClick} />,
    );

    fireEvent.click(screen.getByText("Barbell Bench Press"));
    expect(onClick).toHaveBeenCalledWith(mockExercises[0]);
  });

  it("passes className to container", () => {
    render(<ExerciseList exercises={mockExercises} className="custom-class" />);

    const section = screen.getByLabelText("Exercise list");
    expect(section).toHaveClass("custom-class");
  });
});
