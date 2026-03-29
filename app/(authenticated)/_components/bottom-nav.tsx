"use client";

import { BookOpenIcon, ClockIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/shared/constants";
import { cn } from "@/shared/utils";
import { BurgerMenu } from "./burger-menu";

export function BottomNav() {
  const pathname = usePathname();

  const isHistoryActive = pathname === ROUTES.HOME;
  const isRoutinesActive =
    pathname === ROUTES.ROUTINES || pathname.startsWith(`${ROUTES.ROUTINES}/`);

  return (
    <nav
      data-slot="bottom-nav"
      className="sticky bottom-0 z-50 flex items-center justify-around border-t bg-background pb-[env(safe-area-inset-bottom)]"
    >
      <Link
        href={ROUTES.HOME}
        aria-current={isHistoryActive ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 py-3 text-xs",
          isHistoryActive ? "text-primary" : "text-muted-foreground",
        )}
      >
        <ClockIcon className="size-5" />
        History
      </Link>

      <Link
        href={ROUTES.WORKOUT_NEW}
        className="flex flex-col items-center gap-1 py-2 text-xs text-primary-foreground"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-primary shadow-sm">
          <PlusIcon className="size-5" />
        </span>
        Start Workout
      </Link>

      <Link
        href={ROUTES.ROUTINES}
        aria-current={isRoutinesActive ? "page" : undefined}
        className={cn(
          "flex flex-1 flex-col items-center gap-1 py-3 text-xs",
          isRoutinesActive ? "text-primary" : "text-muted-foreground",
        )}
      >
        <BookOpenIcon className="size-5" />
        Routines
      </Link>

      <BurgerMenu />
    </nav>
  );
}
