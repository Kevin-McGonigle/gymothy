"use client";

import { ExerciseCard } from "@/components/exercise-card";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import type { ExerciseWithSource } from "@/lib/exercises/use-exercises";

interface ExerciseListProps {
  exercises?: ExerciseWithSource[];
  loading?: boolean;
  onExerciseClick?: (exercise: ExerciseWithSource) => void;
  className?: string;
}

const LOADING_SKELETONS = [1, 2, 3, 4, 5, 6] as const;

export function ExerciseList({
  exercises = [],
  loading = false,
  onExerciseClick,
  className,
}: ExerciseListProps) {
  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className ?? ""}`}
        role="status"
        aria-label="Loading exercises"
      >
        {LOADING_SKELETONS.map((num) => (
          <div key={`loading-${num}`} className="flex flex-col gap-3">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <Empty className={className}>
        <EmptyTitle>No exercises found</EmptyTitle>
        <EmptyDescription>
          Try adjusting your search or filters
        </EmptyDescription>
      </Empty>
    );
  }

  return (
    <section
      className={className}
      aria-label="Exercise list"
      aria-live="polite"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.exerciseId}
            exercise={{
              variant: exercise.isCustom ? "custom" : "api",
              data: exercise,
            }}
            onClick={onExerciseClick}
            priority={index < 3}
          />
        ))}
      </div>
    </section>
  );
}
