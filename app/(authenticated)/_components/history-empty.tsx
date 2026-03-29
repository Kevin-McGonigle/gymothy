import { ClockIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ROUTES } from "@/shared/constants";

export function HistoryEmpty() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ClockIcon />
        </EmptyMedia>
        <EmptyTitle>No workouts yet</EmptyTitle>
        <EmptyDescription>
          Start a workout, track your sets, and get smarter suggestions each
          session.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button render={<Link href={ROUTES.WORKOUT_NEW} />}>
          Start your first workout
        </Button>
      </EmptyContent>
    </Empty>
  );
}
