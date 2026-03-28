import { Loader2Icon } from "lucide-react";

import { cn } from "@/shared/utils";

function Spinner({
  className,
  ref,
  ...props
}: React.ComponentProps<"svg"> & { ref?: React.Ref<SVGSVGElement> }) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      data-slot="spinner"
      ref={ref}
      className={cn(
        "size-4 animate-spin motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Spinner };
