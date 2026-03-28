"use client";

import Image from "next/image";
import { memo, useCallback, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import type { Exercise } from "@/lib/exercises/types";
import type { ExerciseWithSource } from "@/lib/exercises/use-exercises";
import { cn } from "@/lib/utils";

type ExerciseCardExercise =
  | { variant: "api"; data: Exercise }
  | { variant: "custom"; data: ExerciseWithSource };

interface ExerciseCardProps {
  exercise: ExerciseCardExercise;
  className?: string;
  onClick?: (exercise: ExerciseWithSource) => void;
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

  const isCustom = exercise.variant === "custom";
  const data = isCustom ? exercise.data : { ...exercise.data, isCustom: false };

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(data);
    }
  }, [onClick, data]);

  return (
    <Card
      render={<button type="button" aria-label={data.name || "Exercise"} />}
      className={cn(
        "min-h-[2.75rem] overflow-hidden text-left transition-shadow hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        onClick &&
          "cursor-pointer touch-action-manipulation [-webkit-tap-highlight-color:transparent]",
        className,
      )}
      onClick={handleClick}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-muted">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        )}
        {!imageError && data.gifUrl ? (
          <Image
            src={data.gifUrl}
            alt={data.name}
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
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="font-semibold text-lg leading-tight truncate">
            {data.name}
          </CardTitle>
          {isCustom ? (
            <Badge variant="secondary" className="text-xs">
              Custom
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-1.5">
          {data.targetMuscles.slice(0, 1).map((muscle: string) => (
            <Badge key={muscle} variant="secondary" className="text-xs">
              {muscle}
            </Badge>
          ))}
          {data.bodyParts.slice(0, 1).map((part: string) => (
            <Badge key={part} variant="outline" className="text-xs">
              {part}
            </Badge>
          ))}
          {data.equipments.slice(0, 1).map((equipment: string) => (
            <Badge key={equipment} variant="outline" className="text-xs">
              {equipment}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex gap-1.5">
          {data.secondaryMuscles.slice(0, 2).map((muscle: string) => (
            <span key={muscle} className="text-xs text-muted-foreground">
              {muscle}
            </span>
          ))}
        </div>
      </CardFooter>
    </Card>
  );
});
