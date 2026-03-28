import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type * as React from "react";

import { cn } from "@/lib/utils";

function Card({
  className,
  size = "default",
  render,
  ref,
  ...props
}: useRender.ComponentProps<"div"> & {
  size?: "default" | "sm";
  ref?: React.Ref<HTMLElement>;
}) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        ref,
        className: cn(
          "group/card flex flex-col gap-4 overflow-hidden rounded-lg bg-card py-4 text-xs/relaxed text-card-foreground ring-1 ring-foreground/10 has-[>img:first-child]:pt-0 data-[size=sm]:gap-3 data-[size=sm]:py-3 *:[img:first-child]:rounded-t-lg *:[img:last-child]:rounded-b-lg",
          className,
        ),
      },
      props,
    ),
    render,
    state: {
      slot: "card",
      size,
    },
  });
}
Card.displayName = "Card";

function CardHeader({
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      data-slot="card-header"
      ref={ref}
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-4 group-data-[size=sm]/card:px-3 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[size=sm]/card:[.border-b]:pb-3",
        className,
      )}
      {...props}
    />
  );
}
CardHeader.displayName = "CardHeader";

function CardTitle({
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      data-slot="card-title"
      ref={ref}
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}
CardTitle.displayName = "CardTitle";

function CardDescription({
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      data-slot="card-description"
      ref={ref}
      className={cn("text-xs/relaxed text-muted-foreground", className)}
      {...props}
    />
  );
}
CardDescription.displayName = "CardDescription";

function CardAction({
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      data-slot="card-action"
      ref={ref}
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}
CardAction.displayName = "CardAction";

function CardContent({
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      data-slot="card-content"
      ref={ref}
      className={cn("px-4 group-data-[size=sm]/card:px-3", className)}
      {...props}
    />
  );
}
CardContent.displayName = "CardContent";

function CardFooter({
  className,
  ref,
  ...props
}: React.ComponentProps<"div"> & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div
      data-slot="card-footer"
      ref={ref}
      className={cn(
        "flex items-center rounded-b-lg px-4 group-data-[size=sm]/card:px-3 [.border-t]:pt-4 group-data-[size=sm]/card:[.border-t]:pt-3",
        className,
      )}
      {...props}
    />
  );
}
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
};
