import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      data-slot="skeleton"
      ref={ref}
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

export { Skeleton };
