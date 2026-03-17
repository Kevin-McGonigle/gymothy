"use client";

import Image from "next/image";
import { memo, useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Exercise } from "@/lib/exercises/types";
import { cn } from "@/lib/utils";

interface ExerciseCardProps {
  exercise: Exercise;
  className?: string;
  onClick?: (exercise: Exercise) => void;
  priority?: boolean;
}

export const ExerciseCard = memo(function ExerciseCard({
  exercise,
  className,
  onClick,
  priority = false,
}: ExerciseCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(exercise);
    }
  }, [onClick, exercise]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <Card
      className={cn(
        "overflow-hidden cursor-pointer transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        onClick &&
          "min-h-[2.75rem] touch-action-manipulation [-webkit-tap-highlight-color:transparent]",
        className,
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={onClick ? 0 : -1}
      role={onClick ? "button" : undefined}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
        {!imageError && exercise.gifUrl ? (
          <Image
            src={exercise.gifUrl}
            alt={exercise.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={cn(
              "object-cover transition-opacity duration-300",
              imageLoading ? "opacity-0" : "opacity-100",
            )}
            onLoad={() => setImageLoading(false)}
            onError={() => {
              setImageError(true);
              setImageLoading(false);
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <span className="text-muted-foreground text-sm">No preview</span>
          </div>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <h3 className="font-semibold text-lg leading-tight truncate">
          {exercise.name}
        </h3>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex flex-wrap gap-1.5">
          {exercise.targetMuscles.slice(0, 1).map((muscle) => (
            <Badge key={muscle} variant="secondary" className="text-xs">
              {muscle}
            </Badge>
          ))}
          {exercise.bodyParts.slice(0, 1).map((part) => (
            <Badge key={part} variant="outline" className="text-xs">
              {part}
            </Badge>
          ))}
          {exercise.equipments.slice(0, 1).map((equipment) => (
            <Badge key={equipment} variant="outline" className="text-xs">
              {equipment}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex gap-1.5">
          {exercise.secondaryMuscles.slice(0, 2).map((muscle) => (
            <span key={muscle} className="text-xs text-muted-foreground">
              {muscle}
            </span>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
});
